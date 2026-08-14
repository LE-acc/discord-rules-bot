-- Test-drive vehicles never touch carshowroom_units/listings: they aren't
-- stock, cost nothing, and crashing one never costs the dealership anything.
local ActiveTestDrives = {} -- [citizenid] = { netId, dealership, timer }

QBCore.Functions.CreateCallback('carshowroom:server:startTestDrive', function(source, cb, dealership, listingId)
    local Player = QBCore.Functions.GetPlayer(source)
    local citizenid = Player.PlayerData.citizenid
    if ActiveTestDrives[citizenid] then return cb(false, 'أنت بتست درايف حالياً') end

    local listing = MySQL.single.await('SELECT * FROM carshowroom_listings WHERE id = ? AND dealership = ?', { listingId, dealership })
    if not listing or listing.allow_testdrive ~= 1 then return cb(false, 'ماتسمح فيها تجربة قيادة') end

    ActiveTestDrives[citizenid] = { dealership = dealership, source = source }
    cb(true, listing.vehicle_model, Config.TestDrive.durationMs)
end)

RegisterNetEvent('carshowroom:server:registerTestDriveVehicle', function(netId)
    local citizenid = QBCore.Functions.GetPlayer(source).PlayerData.citizenid
    local session = ActiveTestDrives[citizenid]
    if not session then return end
    session.netId = netId

    session.timer = SetTimeout(Config.TestDrive.durationMs + 5000, function()
        EndTestDrive(citizenid, true)
    end)
end)

RegisterNetEvent('carshowroom:server:endTestDrive', function()
    local citizenid = QBCore.Functions.GetPlayer(source).PlayerData.citizenid
    EndTestDrive(citizenid, false)
end)

function EndTestDrive(citizenid, timedOut)
    local session = ActiveTestDrives[citizenid]
    if not session then return end
    ActiveTestDrives[citizenid] = nil

    if session.netId then
        local veh = NetworkGetEntityFromNetworkId(session.netId)
        if veh and DoesEntityExist(veh) then
            DeleteEntity(veh)
        end
    end

    if timedOut then
        TriggerClientEvent('carshowroom:client:testDriveTimedOut', session.source)
    end
end

AddEventHandler('playerDropped', function()
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then return end
    if ActiveTestDrives[Player.PlayerData.citizenid] then
        EndTestDrive(Player.PlayerData.citizenid, false)
    end
end)
