/** Custom Command - Send a sticky (pinned) embed message */

module.exports = {
    name: "stickymessage",
    description: "Send a pinned embed message to a Discord channel",
    role: "admin",

    options: [
        {
            name: "channel",
            description: "Discord channel ID to send to",
            required: true,
            type: "STRING",
        },
        {
            name: "title",
            description: "Embed title",
            required: true,
            type: "STRING",
        },
        {
            name: "message",
            description: "Embed content (use \\n for new lines)",
            required: true,
            type: "STRING",
        },
        {
            name: "color",
            description: "Embed color hex [Default: #1e90ff]",
            required: false,
            type: "STRING",
        },
    ],

    run: async (client, interaction, args) => {
        const channel = client.channels.cache.get(args.channel);
        if (!channel) return interaction.reply({ content: "Channel not found. Make sure the ID is correct.", ephemeral: true });

        const color = args.color || "#1e90ff";
        const content = args.message.replace(/\\n/g, "\n");

        const embed = new client.Embed()
            .setTitle(args.title)
            .setDescription(content)
            .setColor(color)
            .setTimestamp()
            .setFooter({ text: `Posted by ${interaction.member.displayName}` });

        try {
            const msg = await channel.send({ embeds: [embed] });
            await msg.pin();
            return interaction.reply({ content: `Sticky message sent and pinned in <#${args.channel}>`, ephemeral: false });
        } catch (e) {
            return interaction.reply({ content: `Failed to send: ${e.message || e}`, ephemeral: true });
        }
    },
};
