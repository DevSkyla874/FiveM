/** Custom Command - Server status overview */

module.exports = {
    name: "status",
    description: "Show current server status overview",
    role: "mod",

    run: async (client, interaction) => {
        await interaction.deferReply();

        const playerCount = GetNumPlayerIndices();
        const maxPlayers = GetConvarInt("sv_maxclients", 48);
        const serverName = GetConvar("sv_hostname", "Unknown");
        const txVersion = GetConvar("txAdmin-version", "Unknown");
        const gameBuild = GetConvar("sv_enforceGameBuild", "Unknown");

        // Uptime from resource start
        const uptimeMs = GetGameTimer();
        const uptimeSecs = Math.floor(uptimeMs / 1000);
        const hours = Math.floor(uptimeSecs / 3600);
        const minutes = Math.floor((uptimeSecs % 3600) / 60);
        const uptimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        // Player list summary
        let playerList = "";
        if (playerCount > 0) {
            const players = getPlayers().sort((a, b) => parseInt(a) - parseInt(b));
            const shown = players.slice(0, 20);
            shown.forEach((id) => {
                const name = GetPlayerName(id);
                const ping = GetPlayerPing(id);
                playerList += `\`[${id}]\` ${name} (${ping}ms)\n`;
            });
            if (players.length > 20) {
                playerList += `_...and ${players.length - 20} more_\n`;
            }
        } else {
            playerList = "No players online";
        }

        // Resource count
        let resourceCount = 0;
        let runningCount = 0;
        for (let i = 0; i < GetNumResources(); i++) {
            const resName = GetResourceByFindIndex(i);
            if (resName) {
                resourceCount++;
                if (GetResourceState(resName) === "started") runningCount++;
            }
        }

        // Fill bar for player count
        const fillPercent = Math.round((playerCount / maxPlayers) * 100);
        const filled = Math.round(fillPercent / 10);
        const bar = "█".repeat(filled) + "░".repeat(10 - filled);

        const embed = new client.Embed()
            .setTitle(`${client.config.FiveMServerName} - Server Status`)
            .setColor(playerCount > 0 ? "#2ecc71" : "#e74c3c")
            .addField("Players", `${bar} **${playerCount}/${maxPlayers}** (${fillPercent}%)`, false)
            .addField("Uptime", uptimeStr, true)
            .addField("Game Build", gameBuild, true)
            .addField("txAdmin", txVersion, true)
            .addField("Resources", `${runningCount} running / ${resourceCount} total`, true)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.member.displayName}` });

        if (playerCount > 0) {
            embed.addField("Online Players", playerList, false);
        }

        return interaction.editReply({ embeds: [embed] });
    },
};
