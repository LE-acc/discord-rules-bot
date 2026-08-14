local function getClosestPlayerServerId()
    local myPed = PlayerPedId()
    local myCoords = GetEntityCoords(myPed)
    local closestId, closestDist = nil, 3.0

    for _, playerId in ipairs(GetActivePlayers()) do
        local ped = GetPlayerPed(playerId)
        if ped ~= myPed then
            local dist = #(myCoords - GetEntityCoords(ped))
            if dist < closestDist then
                closestDist = dist
                closestId = GetPlayerServerId(playerId)
            end
        end
    end
    return closestId
end

local function openCatalogMenu(dealership)
    local options = {
        {
            title = 'إضافة سيارة جديدة للمعرض',
            icon = 'fa-solid fa-plus',
            onSelect = function()
                local wholesale = Config.Dealerships[dealership].wholesale
                local modelOptions = {}
                for _, w in ipairs(wholesale) do
                    table.insert(modelOptions, { value = w.model, label = ('%s ($%s جملة)'):format(w.label, w.price) })
                end

                local input = lib.inputDialog('سيارة جديدة', {
                    { type = 'select', label = 'الموديل', options = modelOptions, required = true },
                    { type = 'number', label = 'سعر البيع', required = true, min = 1 },
                    { type = 'textarea', label = 'الوصف' },
                    { type = 'checkbox', label = 'يسمح بتجربة قيادة' },
                })
                if not input then return end

                local ok, msg = lib.callback.await('carshowroom:server:createListing', false, dealership, input[1], input[2], input[3], input[4])
                QBCore.Functions.Notify(msg, ok and 'success' or 'error')
            end,
        },
        {
            title = 'شراء بالجملة (تخزين)',
            icon = 'fa-solid fa-cart-shopping',
            onSelect = function()
                local rows = lib.callback.await('carshowroom:server:getListings', false, dealership)
                local restockOptions = {}
                for _, row in ipairs(rows) do
                    table.insert(restockOptions, {
                        title = row.label,
                        description = ('سعر الجملة: $%s'):format(row.wholesale_price),
                        onSelect = function()
                            local qty = lib.inputDialog(row.label, { { type = 'number', label = 'الكمية', min = 1, max = 20, required = true } })
                            if not qty then return end
                            local ok, msg = lib.callback.await('carshowroom:server:restock', false, dealership, row.id, qty[1])
                            QBCore.Functions.Notify(msg, ok and 'success' or 'error')
                        end,
                    })
                end
                lib.registerContext({ id = 'carshowroom_restock', title = 'شراء بالجملة', options = restockOptions })
                lib.showContext('carshowroom_restock')
            end,
        },
    }
    lib.registerContext({ id = 'carshowroom_catalog', title = 'إدارة الكتالوج', menu = 'carshowroom_root', options = options })
    lib.showContext('carshowroom_catalog')
end

local function openEmployeesMenu(dealership)
    local employees = lib.callback.await('carshowroom:server:getEmployees', false, dealership)
    if not employees then
        QBCore.Functions.Notify('ماعندك صلاحية', 'error')
        return
    end

    local options = {
        {
            title = 'تعيين أقرب لاعب',
            icon = 'fa-solid fa-user-plus',
            onSelect = function()
                local target = getClosestPlayerServerId()
                if not target then
                    QBCore.Functions.Notify('ماحد قريب منك', 'error')
                    return
                end
                local ok, msg = lib.callback.await('carshowroom:server:hireEmployee', false, dealership, target)
                QBCore.Functions.Notify(msg, ok and 'success' or 'error')
            end,
        },
    }

    for _, e in ipairs(employees) do
        table.insert(options, {
            title = e.name,
            description = ('الراتب: $%s | %s%s%s%s'):format(
                e.salary,
                e.can_buy_stock == 1 and 'شراء ' or '',
                e.can_manage_floor == 1 and 'عرض ' or '',
                e.can_finance == 1 and 'خزنة ' or '',
                e.is_admin == 1 and 'مدير' or ''
            ),
            icon = 'fa-solid fa-user',
            onSelect = function()
                local perms = lib.inputDialog(e.name, {
                    { type = 'number', label = 'الراتب', default = e.salary, min = 0 },
                    { type = 'checkbox', label = 'شراء مخزون', checked = e.can_buy_stock == 1 },
                    { type = 'checkbox', label = 'عرض/نقل بالمعرض', checked = e.can_manage_floor == 1 },
                    { type = 'checkbox', label = 'صلاحية الخزنة المالية', checked = e.can_finance == 1 },
                    { type = 'checkbox', label = 'مدير كامل الصلاحيات', checked = e.is_admin == 1 },
                })
                if not perms then return end

                lib.callback.await('carshowroom:server:setSalary', false, dealership, e.citizenid, perms[1])
                lib.callback.await('carshowroom:server:setPermission', false, dealership, e.citizenid, Permissions.BUY_STOCK, perms[2])
                lib.callback.await('carshowroom:server:setPermission', false, dealership, e.citizenid, Permissions.MANAGE_FLOOR, perms[3])
                lib.callback.await('carshowroom:server:setPermission', false, dealership, e.citizenid, Permissions.FINANCE, perms[4])
                lib.callback.await('carshowroom:server:setPermission', false, dealership, e.citizenid, Permissions.ADMIN, perms[5])
                QBCore.Functions.Notify('تم التحديث', 'success')
            end,
        })
        table.insert(options, {
            title = 'فصل ' .. e.name,
            icon = 'fa-solid fa-user-xmark',
            onSelect = function()
                local confirm = lib.alertDialog({ header = 'تأكيد الفصل', content = ('تفصل %s؟'):format(e.name), centered = true, cancel = true })
                if confirm ~= 'confirm' then return end
                local ok, msg = lib.callback.await('carshowroom:server:fireEmployee', false, dealership, e.citizenid)
                QBCore.Functions.Notify(msg, ok and 'success' or 'error')
            end,
        })
    end

    lib.registerContext({ id = 'carshowroom_employees', title = 'الموظفين', menu = 'carshowroom_root', options = options })
    lib.showContext('carshowroom_employees')
end

local function openFinanceMenu(dealership)
    local balance = lib.callback.await('carshowroom:server:getBalance', false, dealership)
    if balance == false then
        QBCore.Functions.Notify('ماعندك صلاحية', 'error')
        return
    end

    local options = {
        { title = 'الرصيد الحالي', description = ('$%s'):format(balance), disabled = true, icon = 'fa-solid fa-vault' },
        {
            title = 'إيداع',
            icon = 'fa-solid fa-arrow-down',
            onSelect = function()
                local input = lib.inputDialog('إيداع', { { type = 'number', label = 'المبلغ', min = 1, required = true } })
                if not input then return end
                local ok, msg = lib.callback.await('carshowroom:server:deposit', false, dealership, input[1])
                QBCore.Functions.Notify(msg, ok and 'success' or 'error')
            end,
        },
        {
            title = 'سحب',
            icon = 'fa-solid fa-arrow-up',
            onSelect = function()
                local input = lib.inputDialog('سحب', { { type = 'number', label = 'المبلغ', min = 1, required = true } })
                if not input then return end
                local ok, msg = lib.callback.await('carshowroom:server:withdraw', false, dealership, input[1])
                QBCore.Functions.Notify(msg, ok and 'success' or 'error')
            end,
        },
        {
            title = 'صرف رواتب الموظفين',
            icon = 'fa-solid fa-money-bill-wave',
            onSelect = function()
                local ok, msg = lib.callback.await('carshowroom:server:paySalaries', false, dealership)
                QBCore.Functions.Notify(msg, ok and 'success' or 'error')
            end,
        },
    }
    lib.registerContext({ id = 'carshowroom_finance', title = 'الخزنة المالية', menu = 'carshowroom_root', options = options })
    lib.showContext('carshowroom_finance')
end

local function openLaptop(dealership)
    lib.registerContext({
        id = 'carshowroom_root',
        title = Config.Dealerships[dealership].label,
        options = {
            { title = 'إدارة الكتالوج', icon = 'fa-solid fa-list', onSelect = function() openCatalogMenu(dealership) end },
            { title = 'الموظفين', icon = 'fa-solid fa-users', onSelect = function() openEmployeesMenu(dealership) end },
            { title = 'الخزنة المالية', icon = 'fa-solid fa-sack-dollar', onSelect = function() openFinanceMenu(dealership) end },
        },
    })
    lib.showContext('carshowroom_root')
end

CreateThread(function()
    for dealership, config in pairs(Config.Dealerships) do
        AddZoneInteraction(config.laptop.xyz, 1.0, {
            {
                icon = 'fa-solid fa-laptop',
                label = 'فتح لابتوب المعرض',
                onSelect = function() openLaptop(dealership) end,
            },
        })
    end
end)
