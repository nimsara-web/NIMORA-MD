/**
 * NIMORA MD - Decode
 * Category: owner
 * 
 * Base64 decode.
 * BOT OWNER + MAIN OWNER.
 */

module.exports = {
    name: 'dec',
    aliases: ['decrypt', 'b64dec'],
    category: 'owner',
    description: 'Base64 decode (owner only)',

    async execute(ctx) {
        const { args, reply, isOwner, isMainOwner, FOOTER } = ctx;

        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        const text = args.join(' ');
        if (!text) {
            return reply(`⚠️ *Usage:* \`.dec [encoded text]\`${FOOTER}`);
        }

        try {
            const decoded = Buffer.from(text, 'base64').toString('utf8');

            // Check if valid
            if (!decoded || decoded.length === 0) {
                return reply(`❌ *Invalid base64!*${FOOTER}`);
            }

            await reply(`🔓 *DECODED*

📥 *Input:*
\`${text.substring(0, 100)}${text.length > 100 ? '...' : ''}\`

📤 *Output:*
${decoded}${FOOTER}`);
        } catch (e) {
            console.error('[DEC] Error:', e.message);
            await reply(`❌ *Invalid base64!*

📝 ${e.message}${FOOTER}`);
        }
    }
};
