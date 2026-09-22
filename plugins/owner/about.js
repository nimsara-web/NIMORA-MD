const config = require('../../config');

module.exports = {
    name: 'about',
    aliases: ['botinfo'],
    category: 'owner',
    description: 'About this bot',

    async execute(ctx) {
        const { reply, number, activeSockets, socketCreationTime, FOOTER } = ctx;

        const start = socketCreationTime.get(number) || Date.now();
        const uptime = Math.floor((Date.now() - start) / 1000);
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);

        await reply(`ℹ️ *ABOUT ${config.botName}*

🤖 *Bot Name:* ${config.botName}
👑 *Creator:* ${config.ownerName}
📞 *Contact:* +${config.supportNumber}
🌐 *Website:* ${config.websiteUrl}
📢 *Channel:* ${config.channelLink}

📊 *Stats:*
• Active Bots: ${activeSockets.size}
• This Bot Uptime: ${h}h ${m}m
• Node Version: ${process.version}
• Platform: ${process.platform}${FOOTER}`);
    }
};
