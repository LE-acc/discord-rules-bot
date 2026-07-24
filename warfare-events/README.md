# Warfare Events

A Discord-connected **server events** panel for FiveM. Members open it in-game with
`/events`, post an event, and it's announced as a rich **embed** in a Discord channel.
No RSVP, no entry fees — creating an event = announcing it.

> Reworked from the `devx-events` concept. Recolored to **dark navy + black**.

## Features
- **`/events`** command opens the panel (NUI).
- **Role-gated** — only members with an allowed Discord role can open it / post.
- Create form: title, category, flyer image URL, location, date, start time, description —
  with a **live Discord embed preview**.
- On post, the server sends the embed to a **Discord webhook** (e.g. `#server-events`).
- The signed-in **Discord name + avatar** show in the panel (bottom-left).
- Recent events persist across restarts (resource KVP store).

### Give / rewards (admins only)
- A **Give** tab appears only for members with an admin Discord role (`Config.AdminRoleIds`).
- Admin browses **every qb-inventory item** (with its real image), picks items and quantities
  into a **prize pool**. The admin never receives items — they only assign them.
- Pick a **winner** from the online-players list and **Deliver** — items are added straight to
  that player's inventory (QBCore).
- The prize pool is **saved per admin** and stays after the panel is closed/reopened (and across
  restarts).
- Every delivery is **logged** to Discord (admin, winner, items) and a **screenshot** of the
  winner is captured via `screenshot-basic` and posted with the log.

## Install
1. Drop the `warfare-events` folder into your server's `resources/`.
2. Add to `server.cfg`:
   ```cfg
   ensure warfare-events

   # secrets (do not hardcode them in config.lua)
   set warfare_bot_token   "YOUR_DISCORD_BOT_TOKEN"
   set warfare_webhook     "https://discord.com/api/webhooks/xxxx/yyyy"   # event announcements
   set warfare_logs_webhook "https://discord.com/api/webhooks/aaaa/bbbb"  # reward logs
   ```
3. Edit `config.lua`:
   - `Config.DiscordGuildId` → your Discord server (guild) ID.
   - `Config.AllowedRoleIds` → the role ID(s) allowed to open/post events.
   - `Config.AdminRoleIds` → the role ID(s) allowed to use the **Give** tab.
   - `Config.Logo` → optional; your logo URL, or `nui://warfare-events/html/logo.svg`.
4. For rewards, run **`qb-core`**, **`qb-inventory`**, and **`screenshot-basic`** on the server.

## Discord setup
- **Webhook (embed):** Channel → Edit Channel → Integrations → Webhooks → New Webhook →
  copy the URL into `warfare_webhook`.
- **Bot (role check):** create an app + bot at the Discord Developer Portal, enable the
  **Server Members Intent**, invite it to your guild, and put its token in `warfare_bot_token`.
  The bot only needs to read members.

## Testing without Discord
`Config.SkipRoleCheck = true` (default) lets anyone open the panel so you can try the UI.
**Set it to `false` for production** so the role gate is enforced. Without a webhook set,
posting still works in-panel but is not sent to Discord (a note is printed to the console).

## Preview the UI in a browser
Open `html/index.html` directly — it detects it's not in-game and shows the panel with
sample events so you can review the look without launching FiveM.

## Status
UI + client/server wiring complete. This is the initial build for review — tell me what to
adjust (colors, fields, layout, embed format) and I'll iterate.

## Files
```
warfare-events/
├── fxmanifest.lua
├── config.lua            # branding, command, Discord IDs, categories
├── client/main.lua       # /events, NUI focus, callbacks
├── server/main.lua       # role check, webhook embed, KVP storage
└── html/
    ├── index.html        # the panel (self-contained NUI)
    └── logo.svg          # default emblem (replaceable)
```
