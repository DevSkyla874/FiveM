/**
 * Live Feed Addon for qbx-discord
 * Sends real-time server events to Discord channels via webhooks
 * - Player joins/leaves
 * - Player deaths (with killer info, weapon, and cause)
 * - In-game chat messages
 */

const { MessageEmbed, WebhookClient } = require("discord.js");

class LiveFeed {
    constructor(z) {
        this.z = z;
        this.enabled = z.config.EnableLoggingWebhooks;
        this.hooks = {};

        if (!this.enabled) return;

        // Initialize webhook clients for live feed channels
        const feedTypes = ["activity", "chat", "money"];
        for (const type of feedTypes) {
            const url = z.config.LoggingWebhooks[type];
            if (url) {
                this.hooks[type] = new WebhookClient({ url: url.replace(/discordapp/g, "discord") });
            }
        }

        this.setupEvents();
        z.utils.log.info("Live feed system loaded.", { tag: "LIVEFEED" });
    }

    setupEvents() {
        // Player join
        on("playerJoining", (oldId) => {
            const source = global.source;
            const name = GetPlayerName(source);
            const ids = this.z.utils.getPlayerIdentifiers(source);
            const discord = ids.discord ? `<@${ids.discord}>` : "Unknown";

            const embed = new MessageEmbed()
                .setColor("#43b581")
                .setTitle("Player Connected")
                .setDescription(`**${name}** joined the server`)
                .addFields(
                    { name: "Server ID", value: `${source}`, inline: true },
                    { name: "Discord", value: discord, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: `Players: ${GetNumPlayerIndices()}` });

            this.sendActivity(embed);
        });

        // Player leave
        on("playerDropped", (reason) => {
            const source = global.source;
            const name = GetPlayerName(source);

            const embed = new MessageEmbed()
                .setColor("#f04747")
                .setTitle("Player Disconnected")
                .setDescription(`**${name}** left the server`)
                .addFields(
                    { name: "Reason", value: reason || "Unknown", inline: false },
                )
                .setTimestamp()
                .setFooter({ text: `Players: ${Math.max(0, GetNumPlayerIndices() - 1)}` });

            this.sendActivity(embed);
        });

        // Player killed by another player
        onNet("baseevents:onPlayerKilled", (killerId, deathData) => {
            const source = global.source;
            const victimName = GetPlayerName(source);
            const killerName = killerId ? GetPlayerName(killerId) : "Unknown";

            const weaponName = this.getWeaponName(deathData.killerweapon);
            const deathType = this.getDeathType(deathData.killertype);

            const embed = new MessageEmbed()
                .setColor("#e74c3c")
                .setTitle("Player Killed")
                .setDescription(`**${victimName}** was killed by **${killerName}**`)
                .addFields(
                    { name: "Weapon", value: weaponName, inline: true },
                    { name: "Type", value: deathType, inline: true },
                    { name: "Victim ID", value: `${source}`, inline: true },
                    { name: "Killer ID", value: `${killerId || "N/A"}`, inline: true },
                )
                .setTimestamp();

            this.sendActivity(embed);
        });

        // Player died (not by another player - fall, drown, etc.)
        onNet("baseevents:onPlayerDied", (deathData) => {
            const source = global.source;
            const victimName = GetPlayerName(source);

            const cause = this.getDeathCause(deathData.killertype, deathData.killerweapon);

            const embed = new MessageEmbed()
                .setColor("#e67e22")
                .setTitle("Player Died")
                .setDescription(`**${victimName}** died`)
                .addFields(
                    { name: "Cause", value: cause, inline: true },
                    { name: "Player ID", value: `${source}`, inline: true },
                )
                .setTimestamp();

            this.sendActivity(embed);
        });

        // Money changes (QBCore bridge events)
        onNet("QBCore:Server:OnMoneyChange", (source, moneyType, amount, action, reason) => {
            const name = GetPlayerName(source);
            const color = action === "add" ? "#2ecc71" : "#e74c3c";
            const symbol = action === "add" ? "+" : "-";
            const actionLabel = action === "add" ? "Received" : "Lost";

            const embed = new MessageEmbed()
                .setColor(color)
                .setTitle(`Money ${actionLabel}`)
                .setDescription(`**${name}** ${actionLabel.toLowerCase()} money`)
                .addFields(
                    { name: "Type", value: moneyType.charAt(0).toUpperCase() + moneyType.slice(1), inline: true },
                    { name: "Amount", value: `${symbol}$${amount.toLocaleString("en-US")}`, inline: true },
                    { name: "Player ID", value: `${source}`, inline: true },
                    { name: "Reason", value: reason || "No reason", inline: false },
                )
                .setTimestamp();

            this.sendMoney(embed);
        });

        // Chat messages
        onNet("chatMessage", (source, name, msg) => {
            if (!msg || msg.startsWith("/")) return; // skip commands

            const embed = new MessageEmbed()
                .setColor("#7289da")
                .setDescription(`**${name}** (${source}): ${msg}`)
                .setTimestamp();

            this.sendChat(embed);
        });
    }

    getWeaponName(hash) {
        const weapons = {
            0x1B06D571: "Fist", 0x5EF9FEC4: "Switchblade", 0x99B507EA: "Knife",
            0xDD5DF8D9: "Machete", 0x958A4A8F: "Baseball Bat", 0x440E4788: "Glass Bottle",
            0x84BD7BFD: "Hatchet", 0x94117305: "Wrench", 0x19044EE0: "Flashlight",
            0xCD274149: "Nightstick", 0x4E875F73: "Crowbar", 0xF9E6AA4B: "Pipe Wrench",
            0x0C472FE2: "Hammer", 0xD8DF3C3C: "Golf Club", 0xDFE37640: "Dagger",
            0x678B81B1: "Pistol", 0x99AEEB3B: "Pistol Mk II", 0x13532244: "Micro SMG",
            0x2BE6766B: "SMG", 0x78A97CD0: "SMG Mk II", 0xEFE7E2DF: "Pump Shotgun",
            0x083839C4: "Carbine Rifle", 0xFAD1F1C9: "Carbine Rifle Mk II",
            0xBFEFFF6D: "Assault Rifle", 0x394F415C: "Assault Rifle Mk II",
            0xAF113F99: "Advanced Rifle", 0xC0A3098D: "Heavy Sniper",
            0xA914799: "Heavy Sniper Mk II", 0x05FC3C11: "Sniper Rifle",
            0x6D544C99: "Musket", 0xC734385A: "MG", 0x9D07F764: "AP Pistol",
            0xBFD21232: "SNS Pistol", 0x88374054: "SNS Pistol Mk II",
            0xD205520E: "Heavy Pistol", 0x83BF0278: "Vintage Pistol",
            0x47757124: "Firework Launcher", 0xB1CA77B1: "Minigun",
            0x42BF8A85: "Grenade Launcher", 0xA284510B: "RPG",
            0x93E220BD: "Homing Launcher", 0x787F0BB: "Molotov",
            0x24B17070: "Grenade", 0x2C3731D9: "Sticky Bomb",
            0xFDBC8A50: "Proximity Mine", 0x060EC506: "Snowball",
            0xBA45E8B8: "Flare", 0x34A67B97: "Parachute",
            0xFBAB5776: "Jerry Can", 0x497FACC3: "Flare Gun",
            0x34A67B97: "Fire Extinguisher",
        };
        return weapons[hash] || `Weapon (${hash || "Unknown"})`;
    }

    getDeathType(type) {
        const types = {
            1: "Melee", 2: "Firearm", 3: "Explosion", 4: "Fire",
            5: "Fall", 6: "Vehicle", 7: "Drowning", 8: "Electric",
        };
        return types[type] || `Type ${type || "Unknown"}`;
    }

    getDeathCause(type, weapon) {
        switch (type) {
        case 5: return "Fell to their death";
        case 7: return "Drowned";
        case 4: return "Burned to death";
        case 3: return "Killed by explosion";
        case 6: return "Ran over / Vehicle accident";
        case 8: return "Electrocuted";
        default:
            if (weapon) return `Killed by ${this.getWeaponName(weapon)}`;
            return "Unknown cause";
        }
    }

    sendActivity(embed) {
        if (!this.hooks.activity) return;
        this.hooks.activity.send({
            username: "Server Activity",
            embeds: [embed],
        }).catch((e) => this.z.utils.log.error(`Activity webhook failed: ${e}`, { tag: "LIVEFEED" }));
    }

    sendMoney(embed) {
        if (!this.hooks.money) return;
        this.hooks.money.send({
            username: "Server Economy",
            embeds: [embed],
        }).catch((e) => this.z.utils.log.error(`Money webhook failed: ${e}`, { tag: "LIVEFEED" }));
    }

    sendChat(embed) {
        if (!this.hooks.chat) return;
        this.hooks.chat.send({
            username: "Server Chat",
            embeds: [embed],
        }).catch((e) => this.z.utils.log.error(`Chat webhook failed: ${e}`, { tag: "LIVEFEED" }));
    }
}

module.exports = LiveFeed;
