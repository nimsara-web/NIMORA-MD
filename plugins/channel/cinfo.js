const config = require('../../config');

module.exports = {
    name: 'cinfo',
    aliases: ['channelinfo'],
    category: 'channel',
    description: 'WhatsApp channel info',

    async execute(ctx) {
        const { reply, FOOTER } = ctx;

        await reply(`📢 *CHANNEL INFO*

📛 *Name:* ${config.channelName}
🆔 *JID:* \`${config.channelJid}\`
🔗 *Link:* ${config.channelLink}
👤 *Owner:* ${config.ownerName}

💡 Follow the channel for updates!${FOOTER}`);
    }
};
