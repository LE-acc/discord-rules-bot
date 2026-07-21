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
