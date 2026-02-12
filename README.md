# qbx-discord - QBox Discord Management Bot

A feature-rich Discord bot for QBox (QBX) FiveM servers with 44+ slash commands, live feed system, and full QBox native integration.

Based on [zdiscord](https://github.com/zfbx/zdiscord) by Tony/zfbx. Licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## Features

- **44+ Slash Commands** - Player management, moderation, economy, inventory, vehicles, and more
- **3-Tier Permission System** - Mod, Admin, God roles with hierarchical access
- **Live Feed System** - Real-time Discord webhooks for player activity, chat, deaths, and money
- **QBox Native** - Uses qbx_core exports, ox_inventory direct integration, ox_lib notifications
- **Resource Compatibility** - illenium-appearance, xt-prison, cd_easytime/Renewed-Weathersync, qbx_medical

## Requirements

- **QBox Framework** (qbx_core) with bridge enabled (`setr qbx:enableBridge "true"`)
- **ox_inventory** (direct exports used for item management)
- **ox_lib** (notifications, callbacks)
- **FiveM Server Artifacts** build 4890+ (Node16 support)
- **yarn** builder (comes with default FiveM artifacts in `[cfx-default]/[system]/[builders]/yarn`)

## Installation

### Step 1: Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and name it
3. Go to **Bot** tab and click **Reset Token** - copy the token
4. Enable these **Privileged Gateway Intents**:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
5. Go to **OAuth2 > URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Administrator`
6. Copy the generated URL and invite the bot to your Discord server

### Step 2: Get Discord IDs

Enable Developer Mode in Discord (Settings > Advanced > Developer Mode), then right-click to copy IDs:

- **Guild (Server) ID** - Right-click server name > Copy Server ID
- **Mod Role ID** - Right-click mod role > Copy Role ID
- **Admin Role ID** - Right-click admin role > Copy Role ID
- **God Role ID** - Right-click owner/god role > Copy Role ID
- **Staff Channel ID** - Right-click staff channel > Copy Channel ID

### Step 3: Install Resource

1. Copy the `qbx-discord` folder into your server's `resources/` directory (e.g. `resources/[standalone]/qbx-discord/`)

2. Run `npm install --production` inside the resource folder to install dependencies (or let yarn handle it on server start)

3. Add to your `server.cfg` or `resources.cfg`:
```
ensure qbx-discord
```

### Step 4: Configure

**Option A: Convars (Recommended)**

Add these to your `server.cfg` or `convars.cfg`:
```cfg
# Discord Bot Token (keep this secret!)
set discord_token "YOUR_BOT_TOKEN_HERE"

# Discord Server ID
set discord_guild_id "YOUR_GUILD_ID"

# Permission Roles
set discord_mod_role "YOUR_MOD_ROLE_ID"
set discord_admin_role "YOUR_ADMIN_ROLE_ID"
set discord_god_role "YOUR_GOD_ROLE_ID"

# Staff Chat Channel
set discord_staff_channel_id "YOUR_STAFF_CHANNEL_ID"

# Server Info
set discord_server_name "Your Server Name"
set discord_server_ip "YOUR.SERVER.IP"
set discord_invite "https://discord.gg/your-invite"
```

**Option B: Direct Config**

Edit `config.js` directly and replace the placeholder values.

### Step 5: Webhooks (Optional)

To enable live feed logging:

1. Create Discord webhooks in your desired channels (Channel Settings > Integrations > Webhooks)
2. Edit `config.js`:
   - Set `EnableLoggingWebhooks` to `true`
   - Uncomment and paste webhook URLs for each channel you want:
     - `modlog` - Mod actions
     - `adminlog` - Admin actions
     - `activity` - Player joins/leaves/deaths
     - `chat` - In-game chat
     - `money` - Money transactions

### Step 6: Start

Start/restart your FiveM server. You should see:
```
[qbx-discord] QBCore found! Supported QB commands will be loaded
[qbx-discord] Logged in as YourBot#1234
```

Slash commands auto-register with Discord on first startup (may take up to an hour to appear globally, or instant in your server).

## Command List

See [COMMANDS.md](COMMANDS.md) for the full list of all 44+ commands organized by permission level.

## Troubleshooting

**Bot won't start / "Couldn't start resource"**
- Make sure `node_modules/` exists. Run `npm install --production` in the resource folder.
- Check that your server artifacts are build 4890+ (Node16 required).

**"CHANGE" error on startup**
- You haven't set your bot token. Add it via convar or in config.js.

**Commands not showing in Discord**
- Wait up to 1 hour for global commands to sync, or check your Guild ID is correct.
- Make sure the bot was invited with `applications.commands` scope.

**"This ID seems invalid"**
- The player ID must be their current in-game server ID (shown in player list), not their Discord or license ID.

**Inventory commands failing**
- Requires ox_inventory. The bot calls `exports.ox_inventory` directly.

**Weather/Time commands say "No weather sync resource found"**
- Install qb-weathersync, Renewed-Weathersync, or cd_easytime.

## Credits

- [zdiscord](https://github.com/zfbx/zdiscord) by Tony/zfbx - Original bot framework
- Enhanced with QBox native support, additional commands, and live feed system by DevSkyla874
- License: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
