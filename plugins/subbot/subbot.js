const config = require('../../config');
const { StartBot } = require('../../pair');

module.exports = {
    name: 'subbot',
    aliases: ['addsubbot'],
    category: 'subbot',
    description: 'Request a sub-bot (owner approval)',

    async execute(ctx) {
        const { reply, socket, senderNumber, sender, msg, channelContext, FOOTER } = ctx;

        await reply(`🤖 *SUB-BOT REQUEST*

📱 *Your Number:* +${senderNumber}

💡 To get a sub-bot:
1. Contact bot owner
2. Provide your WhatsApp number
3. Owner will pair your number

📞 *Contact:* +${config.supportNumber}

⚠️ *Note:* Only main owner can add sub-bots.${FOOTER}`);

        // Notify owner
        try {
            const ownerJid = `${config.ownerNumber}@s.whatsapp.net`;
            await socket.sendMessage(ownerJid, {
                text: `🤖 *SUB-BOT REQUEST*

👤 *From:* +${senderNumber}
📍 *Chat:* ${sender}
🕐 *Time:* ${new Date().toLocaleString()}

💡 Reply with \`.pair ${senderNumber}\` to create sub-bot.${FOOTER}`,
                contextInfo: channelContext
            });
        } catch (e) {}
    }
};
