QBCore.Functions.CreateCallback('carshowroom:server:isTruckUnlocked', function(source, cb, dealership)
    local row = MySQL.single.await('SELECT truck_unlocked FROM carshowroom_upgrades WHERE dealership = ?', { dealership })
    cb(row and row.truck_unlocked == 1)
end)

--- One-time purchase that fits the flatbed/hitch rig so the dealership's truck can actually secure cargo ---
QBCore.Functions.CreateCallback('carshowroom:server:buyTruckUpgrade', function(source, cb, dealership)
    if not PlayerHasPermission(source, dealership, Permissions.ADMIN) then return cb(false, 'ماعندك صلاحية') end

    local already = MySQL.scalar.await('SELECT truck_unlocked FROM carshowroom_upgrades WHERE dealership = ?', { dealership })
    if already == 1 then return cb(false, 'التعديل مركب مسبقًا') end

    local Player = QBCore.Functions.GetPlayer(source)
    local cost = Config.Dealerships[dealership].truckUpgradeCost
    if Player.PlayerData.money['bank'] < cost then return cb(false, 'رصيدك ماكفي') end

    Player.Functions.RemoveMoney('bank', cost, 'carshowroom-truck-upgrade')
    MySQL.update.await('UPDATE carshowroom_upgrades SET truck_unlocked = 1 WHERE dealership = ?', { dealership })
    cb(true, 'تم تركيب تعديل الشاحنة، صارت جاهزة تشيل السيارات')
end)

--- Requesting a truck just re-checks permission + unlock; the client spawns a non-persistent utility vehicle ---
QBCore.Functions.CreateCallback('carshowroom:server:requestTruck', function(source, cb, dealership)
    local allowed = PlayerHasPermission(source, dealership, Permissions.BUY_STOCK) or PlayerHasPermission(source, dealership, Permissions.MANAGE_FLOOR)
    if not allowed then return cb(false, 'ماعندك صلاحية') end

    local unlocked = MySQL.scalar.await('SELECT truck_unlocked FROM carshowroom_upgrades WHERE dealership = ?', { dealership })
    if unlocked ~= 1 then return cb(false, 'الشاحنة ماتقدر تشيل سيارات، لازم تركب التعديل من اللابتوب أول') end

    cb(true, Config.Dealerships[dealership].truckModel)
end)
