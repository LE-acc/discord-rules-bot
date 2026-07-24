--============================================================
--  WARFARE EVENTS — server
--  * Role gate  : reads a member's Discord roles with a bot token
--  * Announce   : posts the event as an embed via a Discord webhook
--  * Rewards    : admins pick items (qb-inventory) and deliver them to a
--                 winner; a screenshot + full log is sent to Discord
--  * Storage    : events + per-admin prize pools kept in the resource KVP
--============================================================

local Events = {}
local Prizes = {}          -- [discordId] = { {name,label,image,amount}, ... }
local KVP        = 'warfare_events_v1'
local PRIZE_KVP  = 'warfare_prizes_v1'

-- QBCore (loaded lazily so load order doesn't matter)
local QBCore = nil
CreateThread(function()
    if Config.Framework == 'qb' then
        local ok, core = pcall(function() return exports['qb-core']:GetCoreObject() end)
        if ok then QBCore = core
        else print('[warfare-events] qb-core not found yet — item giving waits until it loads.') end
    end
end)

--------------------------------------------------------------
-- helpers
--------------------------------------------------------------
local MON = { 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec' }

local function formatDate(v)
    if not v or v == '' then return '' end
    local y, m, d = v:match('^(%d%d%d%d)%-(%d%d?)%-(%d%d?)$')
    if not y then return v end
    local mi = tonumber(m)
    if not mi or mi < 1 or mi > 12 then return v end
    return ('%s %d, %s'):format(MON[mi], tonumber(d), y)
end

local function clip(v, max)
    v = tostring(v or ''):gsub('^%s+', ''):gsub('%s+$', '')
    if #v > max then v = v:sub(1, max) end
    return v
end

local function initialsOf(name)
    name = tostring(name or ''):gsub('^%s+', ''):gsub('%s+$', '')
    if name == '' then return '?' end
    local a, b = name:match('^(%S)%S*%s+(%S)')
    if a and b then return (a .. b):upper() end
    return name:sub(1, 2):upper()
end

local function getDiscordId(src)
    for _, id in ipairs(GetPlayerIdentifiers(src)) do
        if id:sub(1, 8) == 'discord:' then return id:sub(9) end
    end
    return nil
end

--------------------------------------------------------------
-- storage
--------------------------------------------------------------
local function saveEvents() SetResourceKvp(KVP, json.encode(Events)) end
local function savePrizes() SetResourceKvp(PRIZE_KVP, json.encode(Prizes)) end

local function loadEvents()
    local raw = GetResourceKvpString(KVP)
    if not raw then return end
    local ok, data = pcall(json.decode, raw)
    if ok and type(data) == 'table' then Events = data end
end

local function loadPrizes()
    local raw = GetResourceKvpString(PRIZE_KVP)
    if not raw then return end
    local ok, data = pcall(json.decode, raw)
    if ok and type(data) == 'table' then Prizes = data end
end

--------------------------------------------------------------
-- events
--------------------------------------------------------------
local function buildEvent(d, user)
    local category = clip(d.category, 24)
    local valid = false
    for _, c in ipairs(Config.Categories) do if c == category then valid = true break end end
    if not valid then category = Config.Categories[1] end

    local host = (user and user.name) or 'Unknown'
    return {
        id           = ('%d-%d'):format(os.time(), math.random(1000, 9999)),
        title        = clip(d.title, 100),
        category     = category,
        flyer        = clip(d.flyer, 400),
        location     = clip(d.location, 60),
        date         = formatDate(clip(d.date, 20)),
        time         = clip(d.time, 40),
        description  = clip(d.description, 1000),
        host         = host,
        hostInitials = initialsOf(host),
        createdBy    = user and user.id or nil,
        ts           = os.time(),
    }
end

local function displayList()
    local out = {}
    for i = 1, #Events do
        local e = Events[i]
        out[i] = {
            title = e.title, cat = e.category,
            loc  = e.location ~= '' and e.location or '—',
            date = e.date ~= '' and e.date or '—',
            time = e.time ~= '' and e.time or '—',
            host = e.host, hi = e.hostInitials,
            description = e.description, flyer = e.flyer,
        }
    end
    return out
end

local function postEmbed(e)
    if Config.EventsWebhook == '' then
        print('[warfare-events] No webhook set (warfare_webhook); skipping Discord announcement.')
        return
    end
    local embed = {
        title  = e.title,
        color  = Config.EmbedColor,
        author = { name = ('%s • %s'):format(e.category, Config.ServerName) },
        footer = { text = ('%s • Server Events'):format(Config.ServerName) },
        fields = {
            { name = 'Location', value = e.location ~= '' and e.location or '—', inline = true },
            { name = 'Date',     value = e.date ~= '' and e.date or '—',         inline = true },
            { name = 'Start',    value = e.time ~= '' and e.time or '—',         inline = true },
        },
        timestamp = os.date('!%Y-%m-%dT%H:%M:%S.000Z'),
    }
    if e.description ~= '' then embed.description = e.description end
    if e.flyer ~= '' then embed.image = { url = e.flyer } end
    PerformHttpRequest(Config.EventsWebhook, function(status)
        if status ~= 200 and status ~= 204 then
            print(('[warfare-events] Events webhook responded with status %s'):format(tostring(status)))
        end
    end, 'POST', json.encode({ username = Config.PanelTitle, embeds = { embed } }), { ['Content-Type'] = 'application/json' })
end

--------------------------------------------------------------
-- rewards / items
--------------------------------------------------------------
local function buildItemCatalog()
    local out = {}
    if QBCore and QBCore.Shared and QBCore.Shared.Items then
        for name, it in pairs(QBCore.Shared.Items) do
            if type(it) == 'table' then
                local img = it.image or (name .. '.png')
                out[#out + 1] = { name = name, label = it.label or name, image = 'nui://qb-inventory/html/images/' .. img }
            end
        end
        table.sort(out, function(a, b) return (a.label or '') < (b.label or '') end)
    end
    return out
end

local function onlinePlayers()
    local out = {}
    for _, pid in ipairs(GetPlayers()) do
        out[#out + 1] = { id = tonumber(pid), name = GetPlayerName(pid) or ('Player ' .. pid) }
    end
    table.sort(out, function(a, b) return (a.id or 0) < (b.id or 0) end)
    return out
end

-- validate the client's selection against real items + caps
local function sanitizePrizes(list)
    local out = {}
    if type(list) ~= 'table' then return out end
    local haveItems = (QBCore and QBCore.Shared and QBCore.Shared.Items) and true or false
    for _, p in ipairs(list) do
        if type(p) == 'table' and p.name then
            local nm = clip(p.name, 64)
            if (not haveItems) or QBCore.Shared.Items[nm] then
                local amount = math.floor(tonumber(p.amount) or 1)
                if amount < 1 then amount = 1 end
                if amount > Config.MaxItemAmount then amount = Config.MaxItemAmount end
                out[#out + 1] = { name = nm, label = clip(p.label or nm, 64), image = clip(p.image or '', 200), amount = amount }
                if #out >= Config.MaxPrizeItems then break end
            end
        end
    end
    return out
end

local function givePrizesTo(targetId, prizeList)
    if not QBCore then return false, 'framework' end
    local Player = QBCore.Functions.GetPlayer(targetId)
    if not Player then return false, 'offline' end
    for _, p in ipairs(prizeList) do
        Player.Functions.AddItem(p.name, p.amount)
        local itemData = QBCore.Shared.Items[p.name]
        if itemData then
            TriggerClientEvent('qb-inventory:client:ItemBox', targetId, itemData, 'add', p.amount)
        end
    end
    return true
end

local function sendGiveLog(adminUser, target, targetName, prizeList)
    if Config.LogsWebhook == '' then
        print('[warfare-events] No logs webhook (warfare_logs_webhook); reward not logged to Discord.')
    else
        local lines = {}
        for _, p in ipairs(prizeList) do lines[#lines + 1] = ('• %s x%d'):format(p.label or p.name, p.amount) end
        local adminField = (adminUser and adminUser.name or 'Unknown')
        if adminUser and adminUser.id then adminField = adminField .. (' (<@%s>)'):format(adminUser.id) end
        local embed = {
            title = 'Reward delivered',
            color = Config.EmbedColor,
            fields = {
                { name = 'Admin',  value = adminField, inline = false },
                { name = 'Winner', value = ('%s — [%s]'):format(targetName or '?', tostring(target)), inline = false },
                { name = 'Items',  value = (#lines > 0 and table.concat(lines, '\n') or '—'), inline = false },
            },
            footer = { text = ('%s • Rewards'):format(Config.ServerName) },
            timestamp = os.date('!%Y-%m-%dT%H:%M:%S.000Z'),
        }
        PerformHttpRequest(Config.LogsWebhook, function() end, 'POST',
            json.encode({ username = Config.PanelTitle, embeds = { embed } }), { ['Content-Type'] = 'application/json' })
    end

    -- screenshot the winner the moment items land (needs screenshot-basic)
    if Config.Screenshot and Config.LogsWebhook ~= '' then
        local ok = pcall(function()
            exports['screenshot-basic']:requestClientScreenshotUpload(target, Config.LogsWebhook, 'files[0]', {
                encoding = 'jpg', quality = 0.85
            }, function(_, _) end)
        end)
        if not ok then print('[warfare-events] screenshot-basic not available; winner screenshot skipped.') end
    end
end

--------------------------------------------------------------
-- Discord: fetch member + role flags  ->  cb(canOpen, isAdmin, user)
--------------------------------------------------------------
local function fetchMember(src, cb)
    if Config.SkipRoleCheck then
        return cb(true, true, { id = getDiscordId(src), name = GetPlayerName(src) or 'Tester', avatar = nil })
    end
    local uid = getDiscordId(src)
    if not uid then return cb(false, false, nil) end
    if Config.DiscordBotToken == '' then
        print('[warfare-events] No bot token set (warfare_bot_token); cannot verify roles.')
        return cb(false, false, nil)
    end

    local url = ('https://discord.com/api/v10/guilds/%s/members/%s'):format(Config.DiscordGuildId, uid)
    PerformHttpRequest(url, function(status, body)
        if status ~= 200 or not body then return cb(false, false, nil) end
        local ok, m = pcall(json.decode, body)
        if not ok or type(m) ~= 'table' then return cb(false, false, nil) end

        local roleset = {}
        if m.roles then for _, r in ipairs(m.roles) do roleset[r] = true end end

        local canOpen = false
        for _, rid in ipairs(Config.AllowedRoleIds) do if roleset[rid] then canOpen = true break end end
        local isAdmin = false
        for _, rid in ipairs(Config.AdminRoleIds) do if roleset[rid] then isAdmin = true break end end
        if isAdmin then canOpen = true end

        local u = m.user or {}
        local name = m.nick or u.global_name or u.username or 'Member'
        local avatar
        if u.avatar and u.id then avatar = ('https://cdn.discordapp.com/avatars/%s/%s.png?size=128'):format(u.id, u.avatar) end
        cb(canOpen, isAdmin, { id = uid, name = name, avatar = avatar })
    end, 'GET', '', {
        ['Authorization'] = 'Bot ' .. Config.DiscordBotToken,
        ['Content-Type']  = 'application/json',
    })
end

--------------------------------------------------------------
-- net events — events
--------------------------------------------------------------
RegisterNetEvent('warfare:canOpen', function()
    local src = source
    fetchMember(src, function(canOpen, isAdmin, user)
        TriggerClientEvent('warfare:openResult', src, canOpen, isAdmin, user)
        if canOpen then
            TriggerClientEvent('warfare:sendEvents', src, displayList())
        end
    end)
end)

RegisterNetEvent('warfare:requestEvents', function()
    TriggerClientEvent('warfare:sendEvents', source, displayList())
end)

RegisterNetEvent('warfare:createEvent', function(data)
    local src = source
    if type(data) ~= 'table' then return end
    fetchMember(src, function(canOpen, _, user)
        if not canOpen then
            TriggerClientEvent('warfare:notify', src, 'You are not allowed to post events.', 'error')
            return
        end
        if not data.title or tostring(data.title):gsub('%s', '') == '' then
            TriggerClientEvent('warfare:notify', src, 'An event title is required.', 'error')
            return
        end
        local ev = buildEvent(data, user)
        table.insert(Events, 1, ev)
        while #Events > Config.MaxEvents do table.remove(Events) end
        saveEvents()
        postEmbed(ev)
        TriggerClientEvent('warfare:notify', src, 'Event posted to Discord.', 'success')
        TriggerClientEvent('warfare:sendEvents', -1, displayList())
    end)
end)

--------------------------------------------------------------
-- net events — rewards (admin only)
--------------------------------------------------------------
RegisterNetEvent('warfare:getGive', function()
    local src = source
    fetchMember(src, function(_, isAdmin)
        if not isAdmin then
            print(('[warfare-events] getGive: player %s is not admin — Give data not sent.'):format(src))
            return
        end
        local discordId = getDiscordId(src)
        local items = buildItemCatalog()
        local players = onlinePlayers()
        print(('[warfare-events] getGive -> %d items, %d players (qb-core loaded: %s)'):format(#items, #players, tostring(QBCore ~= nil)))
        TriggerClientEvent('warfare:giveData', src, {
            items   = items,
            prizes  = (discordId and Prizes[discordId]) or {},
            players = players,
        })
    end)
end)

RegisterNetEvent('warfare:savePrizes', function(data)
    local src = source
    fetchMember(src, function(_, isAdmin)
        if not isAdmin then return end
        local discordId = getDiscordId(src)
        if not discordId then return end
        Prizes[discordId] = sanitizePrizes(data and data.prizes)
        savePrizes()
    end)
end)

RegisterNetEvent('warfare:givePlayer', function(data)
    local src = source
    if type(data) ~= 'table' then return end
    fetchMember(src, function(_, isAdmin, user)
        if not isAdmin then
            TriggerClientEvent('warfare:notify', src, 'You are not allowed to give items.', 'error')
            return
        end
        local target = tonumber(data.target)
        if not target then return end

        local discordId = getDiscordId(src)
        local prizeList = (discordId and Prizes[discordId]) or {}
        if #prizeList == 0 then
            TriggerClientEvent('warfare:notify', src, 'Select at least one item first.', 'error')
            return
        end
        local targetName = GetPlayerName(target)
        if not targetName then
            TriggerClientEvent('warfare:notify', src, 'That player is not online.', 'error')
            return
        end

        local ok, reason = givePrizesTo(target, prizeList)
        if not ok then
            local msg = (reason == 'offline') and 'That player is not online.' or 'Inventory system not ready.'
            TriggerClientEvent('warfare:notify', src, msg, 'error')
            return
        end

        sendGiveLog(user, target, targetName, prizeList)
        local doneMsg = ('Delivered %d item(s) to %s.'):format(#prizeList, targetName)
        TriggerClientEvent('warfare:notify', src, doneMsg, 'success')
        TriggerClientEvent('warfare:toast',  src, doneMsg)
        TriggerClientEvent('warfare:notify', target, 'You received an event reward!', 'success')
    end)
end)

--------------------------------------------------------------
AddEventHandler('onResourceStart', function(res)
    if res == GetCurrentResourceName() then
        math.randomseed(os.time())
        loadEvents()
        loadPrizes()
    end
end)
