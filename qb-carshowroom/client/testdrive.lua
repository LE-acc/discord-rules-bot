local testDriveActive = false
local testDriveReturnCoords = nil
local testDriveVeh = nil

function RequestTestDrive(dealership, listingId)
    if testDriveActive then
        QBCore.Functions.Notify('أنت بتجربة قيادة حالياً', 'error')
        return
    end

    local ok, modelOrMsg, duration = lib.callback.await('carshowroom:server:startTestDrive', false, dealership, listingId)
    if not ok then
        QBCore.Functions.Notify(modelOrMsg, 'error')
        return
    end

    local ped = PlayerPedId()
    testDriveReturnCoords = GetEntityCoords(ped)
    testDriveActive = true

    local config = Config.Dealerships[dealership]
    local spawn = config.entrance
    local off = Config.TestDrive.spawnOffset

    lib.requestModel(modelOrMsg)
    local veh = CreateVehicle(modelOrMsg, spawn.x + off.x, spawn.y + off.y, spawn.z + off.z, spawn.w, true, false)
    SetEntityAsMissionEntity(veh, true, true)
    SetVehicleOnGroundProperly(veh)
    SetVehicleEngineOn(veh, true, true, false)
    TaskWarpPedIntoVehicle(ped, veh, -1)
    testDriveVeh = veh

    TriggerServerEvent('carshowroom:server:registerTestDriveVehicle', NetworkGetNetworkIdFromEntity(veh))
    QBCore.Functions.Notify('استمتع بتجربة القيادة، مايضرك تصدم فيها ومارح تدفع شي', 'success')

    RunTestDriveCountdown(duration)
end

function RunTestDriveCountdown(durationMs)
    CreateThread(function()
        local remaining = math.floor(durationMs / 1000)
        while testDriveActive and remaining > 0 do
            local mm = math.floor(remaining / 60)
            local ss = remaining % 60
            lib.showTextUI(('🚗 تجربة القيادة: %02d:%02d'):format(mm, ss), {
                position = 'top-center',
                icon = 'stopwatch',
            })
            Wait(1000)
            remaining = remaining - 1
        end
        if testDriveActive then
            FinishTestDrive(true)
        end
    end)
end

function FinishTestDrive(timedOut)
    if not testDriveActive then return end
    testDriveActive = false
    lib.hideTextUI()

    if not timedOut then
        TriggerServerEvent('carshowroom:server:endTestDrive')
    end

    if testDriveVeh and DoesEntityExist(testDriveVeh) then
        DeleteEntity(testDriveVeh)
    end
    testDriveVeh = nil

    local ped = PlayerPedId()
    if testDriveReturnCoords then
        DoScreenFadeOut(300)
        Wait(350)
        SetEntityCoords(ped, testDriveReturnCoords.x, testDriveReturnCoords.y, testDriveReturnCoords.z, false, false, false, false)
        Wait(200)
        DoScreenFadeIn(300)
    end
    testDriveReturnCoords = nil

    QBCore.Functions.Notify('خلصت تجربة القيادة، رجّعناك مكانك', 'primary')
end

RegisterNetEvent('carshowroom:client:testDriveTimedOut', function()
    FinishTestDrive(true)
end)

-- Manual early return: bind however you like (command shown as a safe default)
RegisterCommand('endtestdrive', function()
    if testDriveActive then FinishTestDrive(false) end
end, false)
