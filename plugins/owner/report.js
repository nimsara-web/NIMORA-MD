const config = require('../../config');

module.exports = {
    name: 'report',
    aliases: ['bug', 'issue'],
    category: 'owner',
    description: 'Report a bug to owner',

    async execute(ctx) {
        const { args, reply, socket, sender, senderNumber, msg, channelContext, FOOTER } = ctx;

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .report [issue description]${FOOTER}`);

        try {
            const ownerJid = `${config.ownerNumber}@s.whatsapp.net`;
            await socket.sendMessage(ownerJid, {
                text: `🚨 *BUG REPORT*

👤 *From:* +${senderNumber}
📍 *Chat:* ${sender}
🕐 *Time:* ${new Date().toLocaleString()}

💬 *Message:*
${text}${FOOTER}`,
                contextInfo: channelContext
            });

            await reply(`✅ *Report sent to owner!*\n\n💡 Thank you for your feedback!${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed to send report!${FOOTER}`);
        }
    }
};
