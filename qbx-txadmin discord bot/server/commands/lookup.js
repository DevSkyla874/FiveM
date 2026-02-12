/** Custom Command - Full player lookup (character, money, job, gang, inventory, identifiers) */

module.exports = {
    name: "lookup",
    description: "Get full details on an online player",
    role: "mod",

    options: [
        {
            name: "id",
            description: "Player's server ID",
            required: true,
            type: "INTEGER",
        },
    ],

    run: async (client, interaction, args) => {
        if (!GetPlayerName(args.id)) return interaction.reply({ content: "This ID seems invalid.", ephemeral: true });

        const player = client.QBCore ? client.QBCore.Functions.GetPlayer(args.id) : null;
        const serverName = GetPlayerName(args.id);
        const ping = GetPlayerPing(args.id);

        await interaction.deferReply();

        const embed = new client.Embed()
            .setTitle(`Player Lookup: ${serverName} (ID: ${args.id})`)
            .setColor("#5865F2")
            .setTimestamp();

        // --- Identifiers ---
        const ids = client.utils.getPlayerIdentifiers(args.id);
        let idText = "";
        for (const [key, value] of Object.entries(ids)) {
            if (key === "discord") idText += `**Discord:** <@${value}>\n`;
            else if (key === "license") idText += `**License:** \`${value.substring(0, 20)}...\`\n`;
            else if (key === "steam") idText += `**Steam:** \`${value}\`\n`;
            else if (key === "fivem") idText += `**FiveM:** \`${value}\`\n`;
        }
        idText += `**Ping:** ${ping}ms`;
        embed.addField("Identifiers", idText, false);

        // --- QBCore data ---
        if (player) {
            const charinfo = player.PlayerData.charinfo;
            const charName = `${charinfo.firstname} ${charinfo.lastname}`;
            const citizenid = player.PlayerData.citizenid;
            const dob = charinfo.birthdate || "Unknown";
            const gender = charinfo.gender === 0 ? "Male" : "Female";
            const nationality = charinfo.nationality || "Unknown";
            const phone = charinfo.phone || "None";

            embed.addField("Character", `**Name:** ${charName}\n**Citizen ID:** \`${citizenid}\`\n**DOB:** ${dob}\n**Gender:** ${gender}\n**Nationality:** ${nationality}\n**Phone:** ${phone}`, true);

            // --- Job & Gang ---
            const job = player.PlayerData.job;
            const gang = player.PlayerData.gang;
            const jobText = `**Job:** ${job.label || job.name} (Grade ${job.grade?.level || 0})\n**On Duty:** ${job.onduty ? "Yes" : "No"}`;
            const gangText = gang && gang.name !== "none" ? `\n**Gang:** ${gang.label || gang.name} (Grade ${gang.grade?.level || 0})` : "\n**Gang:** None";
            embed.addField("Employment", jobText + gangText, true);

            // --- Money ---
            let moneyText = "";
            Object.entries(player.PlayerData.money).forEach(([type, value]) => {
                moneyText += `**${type.charAt(0).toUpperCase() + type.slice(1)}:** $${value.toLocaleString("en-US")}\n`;
            });
            embed.addField("Finances", moneyText.trim(), true);

            // --- Inventory (top items) ---
            const items = player.PlayerData.items;
            let invText = "";
            let count = 0;
            if (items && typeof items === "object") {
                const entries = Array.isArray(items) ? items.filter(Boolean) : Object.values(items);
                for (const i of entries) {
                    if (!i || !i.name) continue;
                    invText += `${i.amount}x **${i.label}** (${i.name})\n`;
                    count++;
                    if (count >= 15) {
                        invText += `_...and more_\n`;
                        break;
                    }
                }
            }
            embed.addField("Inventory", invText || "Empty", false);

            // --- Metadata ---
            const meta = player.PlayerData.metadata;
            let metaText = "";
            if (meta) {
                if (meta.injail !== undefined && meta.injail > 0) metaText += `**In Jail:** ${meta.injail} months\n`;
                if (meta.isdead) metaText += "**Status:** Dead\n";
                if (meta.armor !== undefined) metaText += `**Armor:** ${meta.armor}\n`;
                if (meta.hunger !== undefined) metaText += `**Hunger:** ${Math.round(meta.hunger)}%\n`;
                if (meta.thirst !== undefined) metaText += `**Thirst:** ${Math.round(meta.thirst)}%\n`;
                if (meta.stress !== undefined && meta.stress > 0) metaText += `**Stress:** ${Math.round(meta.stress)}%\n`;
            }
            if (metaText) embed.addField("Status", metaText.trim(), true);

        } else {
            embed.addField("QBCore", "Player data not loaded (not fully connected or QBCore unavailable)", false);
        }

        embed.setFooter({ text: `Requested by ${interaction.member.displayName}` });

        client.utils.log.info(`[${interaction.member.displayName}] Looked up ${serverName} (${args.id})`);
        return interaction.editReply({ embeds: [embed] });
    },
};
