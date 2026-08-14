CreateThread(function()
    for dealership, config in pairs(Config.Dealerships) do
        local coords = config.truckPed
        lib.requestModel(`a_m_m_business_01`)
        local ped = CreatePed(4, `a_m_m_business_01`, coords.x, coords.y, coords.z - 1.0, coords.w, false, true)
        FreezeEntityPosition(ped, true)
        SetEntityInvincible(ped, true)
        SetBlockingOfNonTemporaryEvents(ped, true)

        AddEntityInteraction(ped, {
            {
                icon = 'fa-solid fa-screwdriver-wrench',
                label = 'تركيب تعديل الشاحنة (رفع البضاعة)',
                onSelect = function()
                    local ok, msg = lib.callback.await('carshowroom:server:buyTruckUpgrade', false, dealership)
                    QBCore.Functions.Notify(msg, ok and 'success' or 'error')
                end,
            },
            {
                icon = 'fa-solid fa-truck',
                label = 'استلام شاحنة',
                onSelect = function()
                    local ok, modelOrMsg = lib.callback.await('carshowroom:server:requestTruck', false, dealership)
                    if not ok then
                        QBCore.Functions.Notify(modelOrMsg, 'error')
                        return
                    end

                    lib.requestModel(modelOrMsg)
                    local spawn = coords
                    local veh = CreateVehicle(modelOrMsg, spawn.x + 4.0, spawn.y, spawn.z, spawn.w, true, false)
                    SetEntityAsMissionEntity(veh, true, true)
                    SetVehicleOnGroundProperly(veh)
                    TaskWarpPedIntoVehicle(PlayerPedId(), veh, -1)
                    QBCore.Functions.Notify('خذها للمخزن وفرغها عند نقطة التفريغ', 'success')
                end,
            },
        })
    end
end)
