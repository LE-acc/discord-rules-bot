Config = {}

--============================================================
--  WARFARE EVENTS — configuration
--  Secrets (bot token / webhook) are read from server convars so you never
--  commit them. Put them in server.cfg, e.g.:
--     set warfare_bot_token "YOUR_BOT_TOKEN"
--     set warfare_webhook   "https://discord.com/api/webhooks/xxx/yyy"
--============================================================

-- Chat command that opens the panel in-game  ->  /events
Config.Command = 'events'

-- Branding shown in the panel
Config.ServerName = 'Warfare City'
Config.PanelTitle = 'Warfare Events'
-- Logo shown top-left. Leave '' to keep the built-in emblem, or point it at an
-- image: an external URL, or a bundled file e.g. 'nui://warfare-events/html/logo.png'
Config.Logo = ''

--------------------------------------------------------------
-- Notifications (client-side)
--  All in-game messages (events, give, errors) go through here.
--  Uses your standalone 'notify' resource; if its call differs, just fix the
--  ONE line marked below. A QBCore/native fallback keeps messages showing.
--------------------------------------------------------------
Config.Notify = function(msg, ntype)
    ntype = ntype or 'primary'

    -- >>> YOUR notify script <<<  (tries the common export signatures)
    if GetResourceState('notify') == 'started' then
        local exp = exports['notify']
        if pcall(function() exp:Alert('Warfare Events', msg, 5000, ntype) end) then return end
        if pcall(function() exp:Notify(msg, ntype) end) then return end
        if pcall(function() exp:SendNotification(msg, ntype) end) then return end
    end

    -- fallbacks (so a message always appears)
    if GetResourceState('qb-core') == 'started' then
        exports['qb-core']:GetCoreObject().Functions.Notify(msg, ntype)
        return
    end
    SetNotificationTextEntry('STRING')
    AddTextComponentSubstringPlayerName(msg)
    DrawNotification(false, true)
end

--------------------------------------------------------------
-- Discord — ROLE GATE (who can open the panel / post events)
--------------------------------------------------------------
-- A bot is required to read a member's roles. Invite a bot to your guild,
-- enable the SERVER MEMBERS intent, and give it the token below.
Config.DiscordBotToken = GetConvar('warfare_bot_token', '')   -- keep secret
Config.DiscordGuildId  = '000000000000000000'                 -- your Discord server (guild) ID

-- Only members holding ONE of these role IDs may open the panel and post.
Config.AllowedRoleIds = {
    '000000000000000000', -- e.g. the "Event Host" role ID
}

-- Handy for testing the UI before the bot is set up: when true, everyone can
-- open the panel and role checks are skipped. TURN OFF in production.
Config.SkipRoleCheck = true

--------------------------------------------------------------
-- Discord — EVENT ANNOUNCEMENT (the embed)
--------------------------------------------------------------
-- Webhook for the channel the event embed is posted to (#server-events).
Config.EventsWebhook = GetConvar('warfare_webhook', '')

-- Embed accent, as a decimal color. 3828735 == #3a6dff (the panel blue).
Config.EmbedColor = 3828735

-- Categories offered in the create form.
Config.Categories = { 'Racing', 'Social', 'Sports', 'Community', 'Business', 'Music' }

-- Max events kept/shown in the panel.
Config.MaxEvents = 40

--------------------------------------------------------------
-- Rewards / Give (admin only)
--------------------------------------------------------------
-- Framework used to give items and read the item list.
--   'qb' = QBCore (qb-core + qb-inventory). Item images are read from
--   qb-inventory/html/images/<image>. Only 'qb' is wired up right now.
Config.Framework = 'qb'

-- Discord role(s) allowed to use the GIVE tab (assign + deliver rewards).
-- These are ADMIN roles, separate from the Event Host roles above.
Config.AdminRoleIds = {
    '000000000000000000', -- e.g. the "Admin" role ID
}

-- Detailed reward logs (admin, winner, items, + winner screenshot) go here.
Config.LogsWebhook = GetConvar('warfare_logs_webhook', '')

-- Screenshot the winner the moment items are delivered (needs the
-- 'screenshot-basic' resource running). Posted alongside the log.
Config.Screenshot = true

-- Safety caps for the reward builder.
Config.MaxPrizeItems = 20     -- distinct items in one reward
Config.MaxItemAmount = 1000   -- per item
