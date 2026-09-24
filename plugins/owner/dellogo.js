/**
 * NIMORA MD - Delete/Reset Bot Logo
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
            args, reply, isMainOwner,
            input, number, FOOTER
        } = ctx;

        // 🔒 MAIN OWNER ONLY
        if (!isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can reset bot logo.

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
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
