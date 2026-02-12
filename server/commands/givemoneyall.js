/** Custom Command - Give money to all online players */

module.exports = {
    name: "givemoneyall",
    description: "Give money to every online player",
    role: "god",

    options: [
        {
            name: "moneytype",
            description: "Type of money",
            required: true,
            type: "STRING",
            choices: [
                { name: "Cash", value: "cash" },
                { name: "Bank", value: "bank" },
            ],
        },
        {
            name: "amount",
            description: "Amount to give each player",
            required: true,
            type: "INTEGER",
        },
        {
            name: "reason",
            description: "Reason for giving money",
            required: false,
            type: "STRING",
        },
    ],

    run: async (client, interaction, args) => {
        if (args.amount < 1) return interaction.reply({ content: "Amount must be positive.", ephemeral: true });
        const reason = args.reason || "Staff gift";
        const players = client.QBCore.Functions.GetQBPlayers();
        let count = 0;

        for (const [src, player] of Object.entries(players)) {
            if (player) {
                player.Functions.AddMoney(args.moneytype, args.amount, reason);
                count++;
            }
        }

        client.utils.log.info(`[${interaction.member.displayName}] Gave $${args.amount} ${args.moneytype} to ${count} players: ${reason}`);

        if (client.z.log) {
            client.z.log.send("adminlog", `**${interaction.member.displayName}** gave **$${args.amount.toLocaleString("en-US")}** (${args.moneytype}) to **${count} players**\n**Reason:** ${reason}`, { color: "#2ecc71" });
        }

        return interaction.reply({ content: `Gave $${args.amount.toLocaleString("en-US")} ${args.moneytype} to ${count} online players. Reason: ${reason}`, ephemeral: false });
    },
};
