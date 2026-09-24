/**
 * NIMORA MD - Encode
 * Category: owner
 * 
 * Base64 encode.
 * BOT OWNER + MAIN OWNER.
 */

module.exports = {
    name: 'enc',
    aliases: ['encrypt', 'b64enc'],
    category: 'owner',
    description: 'Base64 encode (owner only)',

    async execute(ctx) {
        const { args, reply, isOwner, isMainOwner, msg, FOOTER } = ctx;

        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        // Get text from args OR quoted message
        let text = args.join(' ');

        if (!text) {
            const quoted = msg.message?.extendedTextMessage?.contextInfo;
            if (quoted?.quotedMessage) {
                const qm = quoted.quotedMessage;
                text = qm.conversation || qm.extendedTextMessage?.text || '';
            }
        }

        if (!text) {
            return reply(`⚠️ *Usage:* \`.enc [text]\`

💡 Or reply to a message with \`.enc\`${FOOTER}`);
        }

        const encoded = Buffer.from(text).toString('base64');

        await reply(`🔐 *ENCODED*

📥 *Input:* ${text}
📤 *Output:*
\`${encoded}\`${FOOTER}`);
    }
};
