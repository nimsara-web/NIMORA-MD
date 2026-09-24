/**
 * NIMORA MD - My Env
 * Category: owner
 * 
 * Show environment config (masked).
 * MAIN OWNER ONLY.
 */

const config = require('../../config');

module.exports = {
    name: 'myenv',
    aliases: ['env', 'envs', 'showenv'],
    category: 'owner',
    description: 'Show environment config (main owner only)',

    async execute(ctx) {
        const { reply, isMainOwner, isOwner, FOOTER } = ctx;

        // ==========================================
        // 🔒 MAIN OWNER ONLY
        // ==========================================
        if (!isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can view environment.

📞 Contact: 0784280074

🔍 *Your status:*
• isOwner: ${isOwner ? '✅' : '❌'}
• isMainOwner: ${isMainOwner ? '✅' : '❌'}${FOOTER}`);
        }

        // ==========================================
        // 🔒 MASK HELPER
        // ==========================================
        const mask = (str) => {
            if (!str) return '❌ not set';
            if (str.length < 8) return '***';
            return str.substring(0, 4) + '...' + str.substring(str.length - 4);
        };

        await reply(`⚙️ *ENVIRONMENT VARIABLES*

━━━━━━━━━━━━━━━━━━
🔐 *SECRETS*
• MONGO_URI: \`${mask(process.env.MONGO_URI)}\`
• NIM_API_KEY: \`${mask(process.env.NIM_API_KEY)}\`

━━━━━━━━━━━━━━━━━━
👤 *OWNER CONFIG*
• Owner Number: \`${config.ownerNumber}\`
• Owner Name: ${config.ownerName}
• Main Owners: ${(config.mainOwnerNumbers || []).map(n => `\`${n}\``).join(', ')}

━━━━━━━━━━━━━━━━━━
🤖 *BOT CONFIG*
• Bot Name: ${config.botName}
• Bot Image: ${mask(config.botImageUrl)}
• Bot Audio: ${mask(config.botAudioUrl)}
• Prefix: \`${config.defaultPrefix}\`
• Mode: \`${config.defaultMode}\`

━━━━━━━━━━━━━━━━━━
📢 *CHANNEL*
• Channel JID: \`${config.channelJid}\`
• Channel Link: ${mask(config.channelLink)}
• Channel Name: ${config.channelName}

━━━━━━━━━━━━━━━━━━
🌐 *WEBSITE*
• Website URL: ${mask(config.websiteUrl)}
• Support Number: \`${config.supportNumber}\`

━━━━━━━━━━━━━━━━━━
📊 *SYSTEM*
• Node: \`${process.version}\`
• Platform: \`${process.platform}\`
• Uptime: \`${Math.floor(process.uptime() / 60)}m\`
• Memory: \`${Math.floor(process.memoryUsage().heapUsed / 1024 / 1024)}MB\`${FOOTER}`);
    }
};
