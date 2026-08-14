QBCore.Functions.CreateCallback('carshowroom:server:getBalance', function(source, cb, dealership)
    if not PlayerHasPermission(source, dealership, Permissions.FINANCE) then return cb(false) end
    local balance = MySQL.scalar.await('SELECT balance FROM carshowroom_dealerships WHERE id = ?', { dealership })
    cb(balance or 0)
end)

QBCore.Functions.CreateCallback('carshowroom:server:getFinanceLog', function(source, cb, dealership)
    if not PlayerHasPermission(source, dealership, Permissions.FINANCE) then return cb(false) end
    local rows = MySQL.query.await('SELECT * FROM carshowroom_finance_log WHERE dealership = ? ORDER BY created_at DESC LIMIT 30', { dealership })
    cb(rows)
end)

QBCore.Functions.CreateCallback('carshowroom:server:deposit', function(source, cb, dealership, amount)
    if not PlayerHasPermission(source, dealership, Permissions.FINANCE) then return cb(false, 'ماعندك صلاحية') end
    amount = math.floor(tonumber(amount) or 0)
    if amount < 1 then return cb(false, 'مبلغ غير صحيح') end

    local Player = QBCore.Functions.GetPlayer(source)
    if Player.PlayerData.money['bank'] < amount then return cb(false, 'رصيدك ماكفي') end

    Player.Functions.RemoveMoney('bank', amount, 'carshowroom-deposit')
    MySQL.update.await('UPDATE carshowroom_dealerships SET balance = balance + ? WHERE id = ?', { amount, dealership })
    MySQL.insert.await('INSERT INTO carshowroom_finance_log (dealership, citizenid, action, amount, note) VALUES (?, ?, ?, ?, ?)',
        { dealership, Player.PlayerData.citizenid, 'deposit', amount, nil })

    cb(true, 'تم الإيداع')
end)

QBCore.Functions.CreateCallback('carshowroom:server:withdraw', function(source, cb, dealership, amount)
    if not PlayerHasPermission(source, dealership, Permissions.FINANCE) then return cb(false, 'ماعندك صلاحية') end
    amount = math.floor(tonumber(amount) or 0)
    if amount < 1 then return cb(false, 'مبلغ غير صحيح') end

    local balance = MySQL.scalar.await('SELECT balance FROM carshowroom_dealerships WHERE id = ?', { dealership })
    if balance < amount then return cb(false, 'رصيد المعرض ماكفي') end

    local Player = QBCore.Functions.GetPlayer(source)
    MySQL.update.await('UPDATE carshowroom_dealerships SET balance = balance - ? WHERE id = ?', { amount, dealership })
    Player.Functions.AddMoney('bank', amount, 'carshowroom-withdraw')
    MySQL.insert.await('INSERT INTO carshowroom_finance_log (dealership, citizenid, action, amount, note) VALUES (?, ?, ?, ?, ?)',
        { dealership, Player.PlayerData.citizenid, 'withdraw', amount, nil })

    cb(true, 'تم السحب')
end)
