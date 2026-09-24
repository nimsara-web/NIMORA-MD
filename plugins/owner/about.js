/**
 * NIMORA MD - About Bot
 * Category: owner
 * 
 * Show bot info.
 * Public — anyone can use.
 */

const config = require('../../config');

module.exports = {
    name: 'about',
    aliases: ['botinfo', 'info'],
    category: 'owner',
    description: 'About this bot',

    async execute(ctx) {
        const { reply, number, activeSockets, socketCreationTime, FOOTER } = ctx;

        const start = socketCreationTime.get(number) || Date.now();
        const uptime = Math.floor((Date.now() - start) / 1000);
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = Math.floor(uptime % 60);

        await reply(`ℹ️ *ABOUT ${config.botName.toUpperCase()}*

━━━━━━━━━━━━━━━━━━
🤖 *BOT INFO*
• Name: ${config.botName}
• Creator: ${config.ownerName}
• Prefix: \`${config.defaultPrefix}\`

━━━━━━━━━━━━━━━━━━
📞 *CONTACT*
• Support: +${config.supportNumber}
• Website: ${config.websiteUrl}
• Channel: ${config.channelLink}

━━━━━━━━━━━━━━━━━━
📊 *LIVE STATS*
• Active Bots: ${activeSockets.size}
• Bot Uptime: ${h}h ${m}m ${s}s

━━━━━━━━━━━━━━━━━━
⚙️ *SYSTEM*
• Node: \`${process.version}\`
• Platform: \`${process.platform}\`
• Server Uptime: ${Math.floor(process.uptime() / 60)}m

> © ᴄʀᴇᴀᴛᴏʀ ʙY ɴɪᴍꜱᴀʀᴀ 🥷🏻${FOOTER}`);
    }
};
