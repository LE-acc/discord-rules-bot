QBCore.Functions.CreateCallback('carshowroom:server:getEmployees', function(source, cb, dealership)
    if not PlayerHasPermission(source, dealership, Permissions.ADMIN) then return cb(false) end
    local rows = MySQL.query.await('SELECT * FROM carshowroom_employees WHERE dealership = ?', { dealership })
    cb(rows)
end)

QBCore.Functions.CreateCallback('carshowroom:server:hireEmployee', function(source, cb, dealership, targetId)
    if not PlayerHasPermission(source, dealership, Permissions.ADMIN) then return cb(false, 'ماعندك صلاحية') end

    local Target = QBCore.Functions.GetPlayer(tonumber(targetId))
    if not Target then return cb(false, 'اللاعب مو موجود بالسيرفر') end

    local name = ('%s %s'):format(Target.PlayerData.charinfo.firstname, Target.PlayerData.charinfo.lastname)
    local ok = pcall(function()
        MySQL.insert.await('INSERT INTO carshowroom_employees (dealership, citizenid, name) VALUES (?, ?, ?)',
            { dealership, Target.PlayerData.citizenid, name })
    end)
    cb(ok, ok and ('تم تعيين %s'):format(name) or 'موظف عنده حساب هنا مسبقًا')
end)

QBCore.Functions.CreateCallback('carshowroom:server:fireEmployee', function(source, cb, dealership, citizenid)
    if not PlayerHasPermission(source, dealership, Permissions.ADMIN) then return cb(false, 'ماعندك صلاحية') end
    MySQL.query.await('DELETE FROM carshowroom_employees WHERE dealership = ? AND citizenid = ?', { dealership, citizenid })
    cb(true, 'تم الفصل')
end)

QBCore.Functions.CreateCallback('carshowroom:server:setPermission', function(source, cb, dealership, citizenid, permission, value)
    if not PlayerHasPermission(source, dealership, Permissions.ADMIN) then return cb(false, 'ماعندك صلاحية') end

    local column = nil
    for _, p in pairs(Permissions) do
        if p == permission then column = p end
    end
    if not column then return cb(false, 'صلاحية غير معروفة') end

    MySQL.update.await(('UPDATE carshowroom_employees SET %s = ? WHERE dealership = ? AND citizenid = ?'):format(column),
        { value and 1 or 0, dealership, citizenid })
    cb(true)
end)

QBCore.Functions.CreateCallback('carshowroom:server:setSalary', function(source, cb, dealership, citizenid, amount)
    if not PlayerHasPermission(source, dealership, Permissions.ADMIN) then return cb(false, 'ماعندك صلاحية') end
    amount = math.floor(tonumber(amount) or 0)
    if amount < 0 then return cb(false, 'مبلغ غير صحيح') end
    MySQL.update.await('UPDATE carshowroom_employees SET salary = ? WHERE dealership = ? AND citizenid = ?', { amount, dealership, citizenid })
    cb(true)
end)

--- Pays every employee their configured salary out of the dealership's own balance, all-or-nothing ---
QBCore.Functions.CreateCallback('carshowroom:server:paySalaries', function(source, cb, dealership)
    if not PlayerHasPermission(source, dealership, Permissions.FINANCE) then return cb(false, 'ماعندك صلاحية') end

    local employees = MySQL.query.await('SELECT * FROM carshowroom_employees WHERE dealership = ? AND salary > 0', { dealership })
    local total = 0
    for _, e in ipairs(employees) do total = total + e.salary end

    local balance = MySQL.scalar.await('SELECT balance FROM carshowroom_dealerships WHERE id = ?', { dealership })
    if balance < total then return cb(false, ('رصيد المعرض ماكفي (تحتاج %s)'):format(total)) end

    MySQL.update.await('UPDATE carshowroom_dealerships SET balance = balance - ? WHERE id = ?', { total, dealership })

    for _, e in ipairs(employees) do
        local OnlinePlayer = QBCore.Functions.GetPlayerByCitizenId(e.citizenid)
        if OnlinePlayer then
            OnlinePlayer.Functions.AddMoney('bank', e.salary, 'carshowroom-salary')
        else
            -- offline: credit via direct DB update so it's there on next login
            MySQL.update.await('UPDATE players SET money = JSON_SET(money, "$.bank", JSON_EXTRACT(money, "$.bank") + ?) WHERE citizenid = ?', { e.salary, e.citizenid })
        end
    end

    MySQL.insert.await('INSERT INTO carshowroom_finance_log (dealership, citizenid, action, amount, note) VALUES (?, ?, ?, ?, ?)',
        { dealership, QBCore.Functions.GetPlayer(source).PlayerData.citizenid, 'salary', total, ('رواتب %s موظف'):format(#employees) })

    cb(true, ('تم صرف الرواتب، الإجمالي %s'):format(total))
end)
