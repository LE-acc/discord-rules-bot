# MEMPHIS — Server Events (UI mockup)

**Status:** UI only — no script/backend logic yet. This is the initial visual for
review before building the FiveM resource.

## What this is
A redesigned front-end (NUI) for a FiveM server-events panel, reworked from the
original `devx-events` concept.

## Changes from the original concept
- **Removed:** joining events (RSVP / max participants) and entry fees.
- **New direction — Discord-first:** creating an event posts an **embed** to a
  Discord channel (`#server-events`) with the flyer, location, date and start time.
  The create form shows a **live Discord embed preview**.
- **Access:** panel is opened in-game with the `/events` command and is gated to a
  specific Discord role (`Event Host`). The bottom-left profile shows the signed-in
  Discord username + avatar.
- **Theme:** recolored from red/black to **dark navy + black**, with Discord
  blurple used only for the Discord-related elements.

## Preview
Open `index.html` in a browser. It is a self-contained file (inline CSS/JS,
no external requests) so it drops straight into a FiveM resource `html/` folder
when the backend is built.

## Not built yet (next steps)
- Lua client/server (open on `/events`, role check)
- Discord webhook / bot call that sends the embed
- Persisting/listing real events
