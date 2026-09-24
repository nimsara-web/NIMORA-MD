/**
 * NIMORA MD - Reset Bot Logo
 * Category: owner
 * 
 * Reset bot logo to default.
 * MAIN OWNER ONLY.
 */

const config = require('../../config');

module.exports = {
    name: 'dellogo',
    aliases: ['resetlogo', 'removelogo'],
    category: 'owner',
    description: 'Reset bot logo (main owner only)',

    async execute(ctx) {
        const {
            args, reply, isMainOwner, isOwner,
            input, number, FOOTER
        } = ctx;

        // ==========================================
        // 🔒 STRICT MAIN OWNER CHECK
        // ==========================================
        if (!isMainOwner) {
            const mainOwners = (config.mainOwnerNumbers || [])
                .map(n => `• +${n}`).join('\n') || '• 94784280074';

            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can reset the bot logo.

🔒 *Main Owners:*
${mainOwners}

📞 Contact: 0784280074${FOOTER}`);
        }

        const confirm = args[0]?.toLowerCase();
        if (confirm !== 'confirm') {
            return reply(`⚠️ *CONFIRM RESET*

🎯 Will reset bot logo to default.

*Usage:* \`.dellogo confirm\`${FOOTER}`);
        }

        try {
            await input('BOT_LOGO', config.botImageUrl, number);
            await reply(`✅ *Bot logo reset to default!*

🖼️ ${config.botImageUrl}${FOOTER}`);

            console.log(`[DELLOGO] ✅ Logo reset by ${ctx.senderNumber}`);
        } catch (e) {
            console.error(`[DELLOGO] Error:`, e.message);
            await reply(`❌ *Failed:* ${e.message}${FOOTER}`);
        }
    }
};
