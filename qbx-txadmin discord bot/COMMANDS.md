# qbx-discord - Slash Commands

## Permission Levels
> **Mod** - Moderator role (+ Admin & God)
> **Admin** - Administrator role (+ God)
> **God** - Owner/God role only

───────────────────────────────

## Mod Commands
`/onlinecount` - Player count
`/players` - List online players with character names
`/status` - Server status overview (players, uptime, resources)
`/lookup <id>` - Full player details (character, money, job, inventory)
`/jail sentence <id> <time>` - Send player to jail
`/jail free <id>` - Free player from jail
`/warn <id> <reason>` - Warn a player
`/dm <id> <message>` - Private message to player
`/customtp <id> <location>` - Teleport to predefined location
`/onlinecheck` - Right-click Discord user to check if in-game

───────────────────────────────

## Admin Commands
`/kick <id> <reason>` - Kick a player
`/ban <id> <time> <reason>` - Ban a player
`/job set <id> <job> <grade>` - Set player's job
`/job fire <id>` - Fire player from job
`/job inspect <id>` - Check player's job
`/gang set <id> <gang> <grade>` - Set player's gang
`/gang kick <id>` - Remove from gang
`/gang inspect <id>` - Check player's gang
`/inventory give <id> <item> [count]` - Give item
`/inventory take <id> <item> [count]` - Take item
`/inventory inspect <id>` - View player's inventory
`/clearinventory <id>` - Wipe player's entire inventory
`/revive <id>` - Revive a downed player
`/kill <id>` - Kill a player
`/clothing-menu <id>` - Open clothing menu for player
`/logout <id>` - Send player to character select
`/setped <id> <model>` - Change player model
`/clearworld <type>` - Clear props/vehicles/peds/all
`/weather set <weather>` - Set weather
`/weather blackout` - Toggle blackout
`/time <hour>` - Set time of day
`/changelog <channel> <version>` - Post styled changelog embed
`/stickymessage <channel> <title> <message>` - Send and pin embed
`/unjail <id>` - Release from jail

───────────────────────────────

## God Commands
`/money add <id> <type> <amount>` - Give money
`/money remove <id> <type> <amount>` - Remove money
`/money set <id> <type> <amount>` - Set money (overwrite)
`/money inspect <id>` - Check player's finances
`/givemoneyall <type> <amount>` - Give money to all online players
`/vehicle give <id> <model> [plate]` - Give permanent garage vehicle
`/vehicle lookup <plate>` - Look up vehicle by plate
`/givecar <id> <model> [garage]` - Give car (alternate)
`/permissions add <id> <level>` - Give admin/god permission (session)
`/permissions remove <id>` - Remove permissions (session)
`/resource restart <name>` - Restart a FiveM resource
`/resource stop <name>` - Stop a resource
`/resource start <name>` - Start a resource
`/kickall [reason]` - Kick all players
`/revive-all` - Revive all players
`/announcement <message>` - Server-wide announcement
`/txadmin ban <id> <reason> [duration]` - Ban via txAdmin
`/txadmin unban <banid>` - Unban via txAdmin
`/txadmin restart [delay] [reason]` - Schedule server restart
`/txadmin kick <id> <reason>` - Kick via txAdmin
`/whitelist` - Whitelist management
`/screenshot <id>` - Capture player's screen
`/embed` - Send custom embed
`/identifiers <id>` - Get player identifiers (license, steam, discord)
`/message <id> <message>` - Send chat message to player
`/server` - Server info

───────────────────────────────

**Total: 44 slash commands** (+ right-click onlinecheck)

## Live Feed Webhooks
> **Activity** - Player joins, leaves, deaths (with weapon/killer details)
> **Chat** - In-game chat messages
> **Money** - Money transactions (add/remove with amounts)
> **Modlog** - Mod actions logged via webhook
> **Adminlog** - Admin actions logged via webhook
