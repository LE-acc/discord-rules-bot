local function slotToCoords(config, slot)
    local w = config.warehouse
    local col = (slot - 1) % w.gridColumns
    local row = math.floor((slot - 1) / w.gridColumns)
    return vector4(
        w.gridOrigin.x + col * w.gridSpacingX,
        w.gridOrigin.y + row * w.gridSpacingY,
        w.gridOrigin.z,
        0.0
    )
end

local function spawnWarehouseUnit(dealership, config, unit)
    local coords = slotToCoords(config, unit.warehouse_slot)

    -- Avoid duplicate spawns when multiple clients enter the warehouse around the same time.
    local existing = lib.getClosestVehicle(coords.xyz, 1.0, false)
    if existing then return end

    lib.requestModel(unit.vehicle_model)
    local veh = CreateVehicle(unit.vehicle_model, coords.x, coords.y, coords.z, coords.w, false, false)
    SetEntityAsMissionEntity(veh, true, true)
    FreezeEntityPosition(veh, true)
    SetVehicleOnGroundProperly(veh)
    SetEntityInvincible(veh, true)

    AddEntityInteraction(veh, {
        {
            icon = 'fa-solid fa-magnifying-glass',
            label = 'تفاصيل السيارة',
            onSelect = function()
                lib.alertDialog({
                    header = unit.label,
                    content = ('الفئة: %s\nالحالة: نظيفة\nموديل: %s%s'):format(unit.class, unit.vehicle_model, unit.mods_json and unit.mods_json ~= '{}' and '\nمعدلة عشوائيًا' or ''),
                    centered = true,
                })
            end,
        },
    })
end

local function enterWarehouse(dealership)
    local config = Config.Dealerships[dealership]
    local w = config.warehouse
    QBCore.Functions.Notify('دخلت المخزن', 'primary')
    SetEntityCoords(PlayerPedId(), w.interiorCoords.x, w.interiorCoords.y, w.interiorCoords.z, false, false, false, false)
    SetEntityHeading(PlayerPedId(), w.interiorCoords.w)

    local units = lib.callback.await('carshowroom:server:getWarehouseUnits', false, dealership)
    for _, unit in ipairs(units) do
        spawnWarehouseUnit(dealership, config, unit)
    end
end

local function unloadUnitOption(dealership)
    return {
        icon = 'fa-solid fa-truck-ramp-box',
        label = 'تفريغ سيارة من الشاحنة',
        onSelect = function()
            local ok, result = lib.callback.await('carshowroom:server:unloadUnit', false, dealership)
            if not ok then
                QBCore.Functions.Notify(result, 'error')
                return
            end
            spawnWarehouseUnit(dealership, Config.Dealerships[dealership], {
                id = 0, -- purely visual re-render; a fresh getWarehouseUnits call will replace targets on next entry
                vehicle_model = result.model,
                label = result.label,
                class = Config.Dealerships[dealership].class,
                mods_json = result.modsJson,
                warehouse_slot = result.slot,
            })
            QBCore.Functions.Notify(('تم تفريغ %s بالمخزن'):format(result.label), 'success')
        end,
    }
end

local function moveToFloorOption(dealership)
    return {
        icon = 'fa-solid fa-arrow-up-from-bracket',
        label = 'نقل سيارة للمعرض',
        onSelect = function()
            local rows = lib.callback.await('carshowroom:server:getListings', false, dealership)
            local moveOptions = {}
            for _, row in ipairs(rows) do
                if row.warehouse_stock > 0 then
                    table.insert(moveOptions, {
                        title = row.label,
                        description = ('بالمخزن: %s'):format(row.warehouse_stock),
                        onSelect = function()
                            local ok, msg = lib.callback.await('carshowroom:server:moveToFloor', false, dealership, row.id)
                            QBCore.Functions.Notify(msg, ok and 'success' or 'error')
                        end,
                    })
                end
            end
            if #moveOptions == 0 then
                QBCore.Functions.Notify('ماعندك سيارات بالمخزن جاهزة للنقل', 'error')
                return
            end
            lib.registerContext({ id = 'carshowroom_move_floor', title = 'نقل سيارة للمعرض', options = moveOptions })
            lib.showContext('carshowroom_move_floor')
        end,
    }
end

CreateThread(function()
    for dealership, config in pairs(Config.Dealerships) do
        AddZoneInteraction(config.warehouse.entrance.xyz, 1.5, {
            {
                icon = 'fa-solid fa-warehouse',
                label = 'دخول مخزن ' .. config.label,
                onSelect = function() enterWarehouse(dealership) end,
            },
        })

        AddZoneInteraction(config.warehouse.dropPoint.xyz, 2.0, {
            unloadUnitOption(dealership),
            moveToFloorOption(dealership),
        })
    end
end)
