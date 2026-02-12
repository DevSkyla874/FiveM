/** Custom Command - txAdmin integration commands */

const http = require("http");

function txAdminRequest(method, path, body, token, port) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: "localhost",
            port: port || 40120,
            path: path,
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Cookie": `txAdmin-token=${token}`,
            },
        };
        if (data) options.headers["Content-Length"] = Buffer.byteLength(data);

        const req = http.request(options, (res) => {
            let responseData = "";
            res.on("data", (chunk) => responseData += chunk);
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(responseData) });
                } catch {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });
        req.on("error", reject);
        if (data) req.write(data);
        req.end();
    });
}

module.exports = {
    name: "txadmin",
    description: "txAdmin management commands",
    role: "god",

    options: [
        {
            type: "SUB_COMMAND",
            name: "ban",
            description: "Ban a player via txAdmin",
            options: [
                {
                    name: "id",
                    description: "Player's server ID",
                    required: true,
                    type: "INTEGER",
                },
                {
                    name: "reason",
                    description: "Ban reason",
                    required: true,
                    type: "STRING",
                },
                {
                    name: "duration",
                    description: "Ban duration (e.g. 2 hours, 7 days, permanent)",
                    required: false,
                    type: "STRING",
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "unban",
            description: "Unban a player via txAdmin ban ID",
            options: [
                {
                    name: "banid",
                    description: "txAdmin Ban ID",
                    required: true,
                    type: "STRING",
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "restart",
            description: "Schedule a server restart via txAdmin",
            options: [
                {
                    name: "delay",
                    description: "Delay in seconds before restart [Default: 60]",
                    required: false,
                    type: "INTEGER",
                },
                {
                    name: "reason",
                    description: "Restart reason",
                    required: false,
                    type: "STRING",
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "kick",
            description: "Kick a player via txAdmin",
            options: [
                {
                    name: "id",
                    description: "Player's server ID",
                    required: true,
                    type: "INTEGER",
                },
                {
                    name: "reason",
                    description: "Kick reason",
                    required: true,
                    type: "STRING",
                },
            ],
        },
    ],

    run: async (client, interaction, args) => {
        const token = GetConvar("txAdmin-apiToken", "none");
        const port = GetConvarInt("txAdmin-apiPort", 40120);

        if (token === "none") {
            return interaction.reply({ content: "txAdmin API token not available. Make sure txAdmin is running and managing this server.", ephemeral: true });
        }

        await interaction.deferReply();

        if (args.ban) {
            if (!GetPlayerName(args.id)) return interaction.editReply({ content: "This ID seems invalid." });
            const playerName = GetPlayerName(args.id);
            const duration = args.duration || "permanent";

            // Use txAdmin's built-in command
            ExecuteCommand(`txaKickID ${args.id} [Discord-Bot] Banned by ${interaction.member.displayName}: ${args.reason}`);

            // Also use QBCore ban if available
            if (client.QBCore) {
                try {
                    const player = client.QBCore.Functions.GetPlayer(args.id);
                    if (player) {
                        const banData = {
                            name: playerName,
                            discord: client.utils.getPlayerDiscordId(args.id) || "Unknown",
                            reason: args.reason,
                            bannedBy: `Discord: ${interaction.member.displayName}`,
                            expire: duration === "permanent" ? "permanent" : Date.now() + parseDuration(duration),
                        };
                        // Drop the player
                        DropPlayer(args.id, `Banned: ${args.reason}`);
                    }
                } catch (e) { /* QB ban optional */ }
            }

            client.utils.log.info(`[${interaction.member.displayName}] Banned ${playerName} (${args.id}) via txAdmin: ${args.reason} [${duration}]`);

            if (client.z.log) {
                client.z.log.send("adminlog", `**${interaction.member.displayName}** banned **${playerName}** (${args.id})\n**Reason:** ${args.reason}\n**Duration:** ${duration}`, { color: "#e74c3c", pingRole: true });
            }

            return interaction.editReply({ content: `${playerName} (${args.id}) has been banned.\n**Reason:** ${args.reason}\n**Duration:** ${duration}` });
        } else if (args.unban) {
            // Attempt unban via txAdmin API
            try {
                const result = await txAdminRequest("POST", `/api/admin/actions/revoke_ban`, { ban_id: args.banid }, token, port);
                if (result.status === 200) {
                    return interaction.editReply({ content: `Ban ${args.banid} has been revoked.` });
                } else {
                    // Fallback: try unban command
                    ExecuteCommand(`txaUnban ${args.banid}`);
                    return interaction.editReply({ content: `Attempted to revoke ban ${args.banid}. Check txAdmin panel to confirm.` });
                }
            } catch (e) {
                ExecuteCommand(`txaUnban ${args.banid}`);
                return interaction.editReply({ content: `Attempted to revoke ban ${args.banid} via command. Check txAdmin panel to confirm.` });
            }
        } else if (args.restart) {
            const delay = args.delay || 60;
            const reason = args.reason || "Scheduled restart via Discord";

            // Announce to server
            client.utils.chatMessage(-1, "SERVER", `Server restarting in ${delay} seconds: ${reason}`, { color: [255, 50, 50] });

            // Broadcast notification
            const players = getPlayers();
            players.forEach((p) => {
                TriggerClientEvent("ox_lib:notify", p, {
                    title: "Server Restart",
                    description: `Restarting in ${delay}s: ${reason}`,
                    type: "error",
                    duration: delay * 1000,
                });
            });

            // Schedule the restart
            setTimeout(() => {
                ExecuteCommand("txaRestart");
            }, delay * 1000);

            client.utils.log.info(`[${interaction.member.displayName}] Scheduled server restart in ${delay}s: ${reason}`);
            return interaction.editReply({ content: `Server restart scheduled in **${delay} seconds**.\n**Reason:** ${reason}` });
        } else if (args.kick) {
            if (!GetPlayerName(args.id)) return interaction.editReply({ content: "This ID seems invalid." });
            const playerName = GetPlayerName(args.id);

            ExecuteCommand(`txaKickID ${args.id} [Discord-Bot] ${args.reason} (by ${interaction.member.displayName})`);

            client.utils.log.info(`[${interaction.member.displayName}] TX-Kicked ${playerName} (${args.id}): ${args.reason}`);
            return interaction.editReply({ content: `${playerName} (${args.id}) has been kicked via txAdmin: ${args.reason}` });
        }
    },
};

function parseDuration(str) {
    const match = str.match(/(\d+)\s*(hour|day|week|month|minute|min|hr|d|w|m|h)/i);
    if (!match) return 0;
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = {
        "minute": 60000, "min": 60000,
        "hour": 3600000, "hr": 3600000, "h": 3600000,
        "day": 86400000, "d": 86400000,
        "week": 604800000, "w": 604800000,
        "month": 2592000000, "m": 2592000000,
    };
    return num * (multipliers[unit] || 0);
}
