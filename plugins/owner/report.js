/**
 * NIMORA MD - Report Bug
 * Category: owner
 * 
 * Report a bug to owner.
 * Public command — anyone can use.
 */

const config = require('../../config');

module.exports = {
    name: 'report',
    aliases: ['bug', 'issue'],
    category: 'owner',
    description: 'Report a bug to owner',

    async execute(ctx) {
        const {
            args, reply, socket, sender, senderNumber,
            msg, channelContext, FOOTER
        } = ctx;

        const text = args.join(' ');
        if (!text) {
            return reply(`⚠️ *Usage:* \`.report [issue description]\`

*Example:*
\`.report .song command not working\`${FOOTER}`);
        }

        try {
            // Send to main owner
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

            await reply(`✅ *Report sent!*

💡 Owner will review your issue.
📞 Contact: 0784280074${FOOTER}`);

            console.log(`[REPORT] From ${senderNumber}: ${text.substring(0, 50)}`);

        } catch (e) {
            console.error('[REPORT] Error:', e.message);
            await reply(`❌ Failed to send report: ${e.message}${FOOTER}`);
        }
    }
};
