-- Recomputes floor_stock/warehouse_stock straight from the units table so the
-- two counters can never drift out of sync with what's actually parked.
function RecalculateListingCounts(listingId)
    local counts = MySQL.query.await([[
        SELECT location, COUNT(*) as total FROM carshowroom_units
        WHERE listing_id = ? AND location IN ('floor', 'warehouse')
        GROUP BY location
    ]], { listingId })

    local floor, warehouse = 0, 0
    for _, row in ipairs(counts) do
        if row.location == 'floor' then floor = row.total end
        if row.location == 'warehouse' then warehouse = row.total end
    end

    MySQL.update.await('UPDATE carshowroom_listings SET floor_stock = ?, warehouse_stock = ? WHERE id = ?', { floor, warehouse, listingId })
    return floor, warehouse
end

--- Every listing for a dealership, used to populate the floor on join/resource start and drive all menus ---
QBCore.Functions.CreateCallback('carshowroom:server:getListings', function(source, cb, dealership)
    local rows = MySQL.query.await('SELECT * FROM carshowroom_listings WHERE dealership = ?', { dealership })
    cb(rows)
end)

--- Owner/employee: create a new showroom listing from the wholesale catalog ---

QBCore.Functions.CreateCallback('carshowroom:server:createListing', function(source, cb, dealership, model, retailPrice, description, allowTestDrive)
    if not PlayerHasPermission(source, dealership, Permissions.ADMIN) then return cb(false, 'ماعندك صلاحية') end

    local config = Config.Dealerships[dealership]
    local wholesale
    for _, entry in ipairs(config.wholesale) do
        if entry.model == model then wholesale = entry break end
    end
    if not wholesale then return cb(false, 'موديل غير موجود بقائمة الجملة') end

    local ok = pcall(function()
        MySQL.insert.await([[
            INSERT INTO carshowroom_listings (dealership, vehicle_model, label, retail_price, wholesale_price, class, description, allow_testdrive)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ]], { dealership, model, wholesale.label, retailPrice, wholesale.price, config.class, description, allowTestDrive and 1 or 0 })
    end)

    cb(ok, ok and 'تمت الإضافة' or 'هذا الموديل مضاف مسبقًا')
end)

--- Owner/employee: wholesale-purchase units, they land in the buyer's truck manifest ---

QBCore.Functions.CreateCallback('carshowroom:server:restock', function(source, cb, dealership, listingId, qty)
    if not PlayerHasPermission(source, dealership, Permissions.BUY_STOCK) then return cb(false, 'ماعندك صلاحية') end
    qty = math.floor(tonumber(qty) or 0)
    if qty < 1 or qty > 20 then return cb(false, 'كمية غير صحيحة') end

    local Player = QBCore.Functions.GetPlayer(source)
    local listing = MySQL.single.await('SELECT * FROM carshowroom_listings WHERE id = ? AND dealership = ?', { listingId, dealership })
    if not listing then return cb(false, 'السيارة غير موجودة') end

    local total = listing.wholesale_price * qty
    if Player.PlayerData.money['bank'] < total then return cb(false, 'رصيدك بالبنك ماكفي') end

    Player.Functions.RemoveMoney('bank', total, 'carshowroom-restock')
    MySQL.insert.await('INSERT INTO carshowroom_finance_log (dealership, citizenid, action, amount, note) VALUES (?, ?, ?, ?, ?)',
        { dealership, Player.PlayerData.citizenid, 'restock', total, ('%sx %s'):format(qty, listing.label) })

    local config = Config.Dealerships[dealership]
    for _ = 1, qty do
        local mods = nil
        if config.modChance > 0 and math.random() <= config.modChance then
            mods = json.encode(RollRandomMods())
        end
        MySQL.insert.await('INSERT INTO carshowroom_units (listing_id, dealership, location, mods_json) VALUES (?, ?, ?, ?)',
            { listingId, dealership, 'truck', mods })
    end

    cb(true, ('اشتريت %sx %s، خذها بالشاحنة للمخزن'):format(qty, listing.label))
end)

--- Customer: buy exactly one ready unit off the floor ---

QBCore.Functions.CreateCallback('carshowroom:server:buyVehicle', function(source, cb, dealership, listingId)
    local Player = QBCore.Functions.GetPlayer(source)
    local listing = MySQL.single.await('SELECT * FROM carshowroom_listings WHERE id = ? AND dealership = ?', { listingId, dealership })
    if not listing or listing.floor_stock < 1 then return cb(false, 'ماعاد فيه مخزون') end

    if Player.PlayerData.money['bank'] < listing.retail_price then return cb(false, 'رصيدك ماكفي') end

    local unit = MySQL.single.await("SELECT * FROM carshowroom_units WHERE listing_id = ? AND location = 'floor' LIMIT 1", { listingId })
    if not unit then return cb(false, 'ماعاد فيه مخزون') end

    Player.Functions.RemoveMoney('bank', listing.retail_price, 'carshowroom-purchase')

    local dealershipRow = MySQL.single.await('SELECT balance FROM carshowroom_dealerships WHERE id = ?', { dealership })
    MySQL.update.await('UPDATE carshowroom_dealerships SET balance = balance + ? WHERE id = ?', { listing.retail_price, dealership })
    MySQL.insert.await('INSERT INTO carshowroom_finance_log (dealership, citizenid, action, amount, note) VALUES (?, ?, ?, ?, ?)',
        { dealership, Player.PlayerData.citizenid, 'sale', listing.retail_price, listing.label })

    local plate = GenerateUniquePlate()
    MySQL.update.await("UPDATE carshowroom_units SET location = 'sold', plate = ?, owner_citizenid = ? WHERE id = ?",
        { plate, Player.PlayerData.citizenid, unit.id })

    MySQL.insert.await([[
        INSERT INTO player_vehicles (citizenid, vehicle, hash, mods, plate, garage, state, fuel)
        VALUES (?, ?, ?, ?, ?, ?, 1, 100)
    ]], { Player.PlayerData.citizenid, listing.vehicle_model, GetHashKey(listing.vehicle_model), unit.mods_json or '{}', plate, dealership })

    local floor, _ = RecalculateListingCounts(listingId)
    local freedSlot = nil
    if floor == 0 then
        freedSlot = listing.floor_slot
        MySQL.update.await('UPDATE carshowroom_listings SET floor_slot = NULL WHERE id = ?', { listingId })
    end

    TriggerClientEvent('carshowroom:client:vehicleSold', -1, dealership, listingId, freedSlot)
    TriggerClientEvent('carshowroom:client:deliverVehicle', source, dealership, listing.vehicle_model, plate, unit.mods_json)

    cb(true, 'مبروك السيارة الجديدة!')
end)

-- A handful of ranges that read as "modified" without needing a curated
-- per-vehicle mod table. Applied only to Muzaffar restocks per Config.modChance.
function RollRandomMods()
    return {
        engine = math.random(1, 3),
        brakes = math.random(0, 2),
        transmission = math.random(0, 2),
        turbo = math.random() > 0.5,
        wheels = math.random(0, 40),
        color1 = math.random(0, 159),
        color2 = math.random(0, 159),
        windowTint = math.random(0, 6),
    }
end
