--============================================================
--  WARFARE EVENTS — server
--  * Role gate  : reads a member's Discord roles with a bot token
--  * Announce   : posts the event as an embed via a Discord webhook
--  * Storage    : keeps recent events with the resource KVP store
--============================================================

local Events = {}
local KVP = 'warfare_events_v1'

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

-- trim + hard length cap (protects the webhook payload)
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
local function saveEvents()
    SetResourceKvp(KVP, json.encode(Events))
end

local function loadEvents()
    local raw = GetResourceKvpString(KVP)
    if not raw then return end
    local ok, data = pcall(json.decode, raw)
    if ok and type(data) == 'table' then Events = data end
end

--------------------------------------------------------------
-- event objects
--------------------------------------------------------------
local function buildEvent(d, user)
    local category = clip(d.category, 24)
    local valid = false
    for _, c in ipairs(Config.Categories) do
        if c == category then valid = true break end
    end
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

-- map stored events to the shape the UI renders
local function displayList()
    local out = {}
    for i = 1, #Events do
        local e = Events[i]
        out[i] = {
            title       = e.title,
            cat         = e.category,
            loc         = e.location ~= '' and e.location or '—',
            date        = e.date ~= '' and e.date or '—',
            time        = e.time ~= '' and e.time or '—',
            host        = e.host,
            hi          = e.hostInitials,
            description = e.description,
            flyer       = e.flyer,
        }
    end
    return out
end

--------------------------------------------------------------
-- Discord: post the embed
--------------------------------------------------------------
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

    local payload = json.encode({ username = Config.PanelTitle, embeds = { embed } })
    PerformHttpRequest(Config.EventsWebhook, function(status)
        if status ~= 200 and status ~= 204 then
            print(('[warfare-events] Webhook responded with status %s'):format(tostring(status)))
        end
    end, 'POST', payload, { ['Content-Type'] = 'application/json' })
end

--------------------------------------------------------------
-- Discord: fetch member + check role
--  cb(allowed, user)  where user = { id, name, avatar }
--------------------------------------------------------------
local function fetchMember(src, cb)
    if Config.SkipRoleCheck then
        return cb(true, { id = getDiscordId(src), name = GetPlayerName(src) or 'Tester', avatar = nil })
    end

    local uid = getDiscordId(src)
    if not uid then
        return cb(false, nil)
    end
    if Config.DiscordBotToken == '' then
        print('[warfare-events] No bot token set (warfare_bot_token); cannot verify roles.')
        return cb(false, nil)
    end

    local url = ('https://discord.com/api/v10/guilds/%s/members/%s'):format(Config.DiscordGuildId, uid)
    PerformHttpRequest(url, function(status, body)
        if status ~= 200 or not body then return cb(false, nil) end
        local ok, m = pcall(json.decode, body)
        if not ok or type(m) ~= 'table' then return cb(false, nil) end

        local roleset = {}
        if m.roles then
            for _, r in ipairs(m.roles) do roleset[r] = true end
        end
        local allowed = false
        for _, rid in ipairs(Config.AllowedRoleIds) do
            if roleset[rid] then allowed = true break end
        end

        local u = m.user or {}
        local name = m.nick or u.global_name or u.username or 'Member'
        local avatar
        if u.avatar and u.id then
            avatar = ('https://cdn.discordapp.com/avatars/%s/%s.png?size=128'):format(u.id, u.avatar)
        end
        cb(allowed, { id = uid, name = name, avatar = avatar })
    end, 'GET', '', {
        ['Authorization'] = 'Bot ' .. Config.DiscordBotToken,
        ['Content-Type']  = 'application/json',
    })
end

--------------------------------------------------------------
-- net events
--------------------------------------------------------------
RegisterNetEvent('warfare:canOpen', function()
    local src = source
    fetchMember(src, function(allowed, user)
        TriggerClientEvent('warfare:openResult', src, allowed, user)
        if allowed then
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

    fetchMember(src, function(allowed, user)
        if not allowed then
            TriggerClientEvent('warfare:notify', src, '~r~Warfare Events~s~\nYou are not allowed to post events.')
            return
        end
        if not data.title or tostring(data.title):gsub('%s', '') == '' then
            TriggerClientEvent('warfare:notify', src, '~r~Warfare Events~s~\nAn event title is required.')
            return
        end

        local ev = buildEvent(data, user)
        table.insert(Events, 1, ev)
        while #Events > Config.MaxEvents do table.remove(Events) end
        saveEvents()
        postEmbed(ev)

        TriggerClientEvent('warfare:notify', src, '~b~Warfare Events~s~\nEvent posted to Discord.')
        TriggerClientEvent('warfare:sendEvents', -1, displayList())
    end)
end)

--------------------------------------------------------------
AddEventHandler('onResourceStart', function(res)
    if res == GetCurrentResourceName() then
        math.randomseed(os.time())
        loadEvents()
    end
end)
