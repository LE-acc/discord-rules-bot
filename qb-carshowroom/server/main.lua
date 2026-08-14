QBCore = exports['qb-core']:GetCoreObject()

--- Employees ---------------------------------------------------------------

-- Always the source of truth for a permission check. Every server-side
-- money/stock action re-reads this instead of trusting anything the client sent.
function GetEmployee(dealership, citizenid)
    local result = MySQL.single.await(
        'SELECT * FROM carshowroom_employees WHERE dealership = ? AND citizenid = ?',
        { dealership, citizenid }
    )
    return result
end

function PlayerHasPermission(source, dealership, permission)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then return false end
    local employee = GetEmployee(dealership, Player.PlayerData.citizenid)
    return HasDealershipPermission(employee, permission)
end

-- Bootstrapping problem: the employee table starts empty, so nobody could
-- ever grant the first admin from the laptop UI. This console command (ACE
-- 'command' restricted, i.e. server console / god only) seeds one.
QBCore.Commands.Add('cs_bootstrap_admin', 'Grant a player full admin on a dealership (console/admin only)', {
    { name = 'dealership', help = 'muzaffar | sandyshore | alkutub' },
    { name = 'citizenid', help = 'target citizenid' },
}, true, function(source, args)
    local dealership, citizenid = args[1], args[2]
    if not Config.Dealerships[dealership] then return end

    MySQL.insert.await([[
        INSERT INTO carshowroom_employees (dealership, citizenid, name, can_buy_stock, can_manage_floor, can_finance, is_admin)
        VALUES (?, ?, ?, 1, 1, 1, 1)
        ON DUPLICATE KEY UPDATE is_admin = 1, can_buy_stock = 1, can_manage_floor = 1, can_finance = 1
    ]], { dealership, citizenid, 'Owner' })
end, 'admin')

--- Plates --------------------------------------------------------------

function GenerateUniquePlate()
    local chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    local plate
    repeat
        plate = ''
        for _ = 1, 8 do
            local idx = math.random(1, #chars)
            plate = plate .. chars:sub(idx, idx)
        end
        local exists = MySQL.scalar.await('SELECT 1 FROM player_vehicles WHERE plate = ?', { plate })
    until not exists
    return plate
end
