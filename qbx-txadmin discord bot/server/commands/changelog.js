/** Custom Command - Create a styled changelog embed */

module.exports = {
    name: "changelog",
    description: "Post a styled changelog to a Discord channel",
    role: "admin",

    options: [
        {
            name: "channel",
            description: "Discord channel ID to post in",
            required: true,
            type: "STRING",
        },
        {
            name: "version",
            description: "Version or update title (e.g. v1.2.0, February Update)",
            required: true,
            type: "STRING",
        },
        {
            name: "added",
            description: "New features (separate with | for multiple)",
            required: false,
            type: "STRING",
        },
        {
            name: "changed",
            description: "Changes/improvements (separate with | for multiple)",
            required: false,
            type: "STRING",
        },
        {
            name: "fixed",
            description: "Bug fixes (separate with | for multiple)",
            required: false,
            type: "STRING",
        },
    ],

    run: async (client, interaction, args) => {
        const channel = client.channels.cache.get(args.channel);
        if (!channel) return interaction.reply({ content: "Channel not found.", ephemeral: true });

        let description = "";

        if (args.added) {
            const items = args.added.split("|").map(i => `> ✅ ${i.trim()}`).join("\n");
            description += `**Added:**\n${items}\n\n`;
        }
        if (args.changed) {
            const items = args.changed.split("|").map(i => `> 🔄 ${i.trim()}`).join("\n");
            description += `**Changed:**\n${items}\n\n`;
        }
        if (args.fixed) {
            const items = args.fixed.split("|").map(i => `> 🔧 ${i.trim()}`).join("\n");
            description += `**Fixed:**\n${items}\n\n`;
        }

        if (!description) return interaction.reply({ content: "You must provide at least one of: added, changed, or fixed.", ephemeral: true });

        const embed = new client.Embed()
            .setTitle(`📋 Changelog - ${args.version}`)
            .setDescription(description)
            .setColor("#5865F2")
            .setTimestamp()
            .setFooter({ text: `Posted by ${interaction.member.displayName}` });

        try {
            await channel.send({ embeds: [embed] });
            return interaction.reply({ content: `Changelog posted in <#${args.channel}>`, ephemeral: false });
        } catch (e) {
            return interaction.reply({ content: `Failed to post: ${e.message || e}`, ephemeral: true });
        }
    },
};
