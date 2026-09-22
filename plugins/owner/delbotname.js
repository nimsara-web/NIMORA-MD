/**
 * NIMORA MD - Delete/Reset Bot Name
 * Category: owner
 * 
 * Reset bot name to default (NIMORA MD).
 * Owner-only command.
 */

const config = require('../../config');

module.exports = {
    name: 'delbotname',
    aliases: ['resetbotname', 'resetname', 'delname'],
    category: 'owner',
    description: 'Reset bot name to default',

    async execute(ctx) {
        const {
            args, reply, isOwner, isMainOwner,
            get, input, number, FOOTER
        } = ctx;

        // ==========================================
        // 🔑 OWNER CHECK
        // ==========================================
        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only bot owners can reset the bot name.

📞 Contact: 0784280074${FOOTER}`);
        }

        const currentName = await get('BOT_NAME', number) || config.botName;

        // ==========================================
        // ⚠️ CONFIRMATION
        // ==========================================
        const confirm = args[0]?.toLowerCase();
        if (confirm !== 'confirm') {
            return reply(`⚠️ *CONFIRM RESET*

📊 *Current name:* ${currentName}
🎯 *Will reset to:* ${config.botName}

*Usage:* \`.delbotname confirm\`${FOOTER}`);
        }

        // ==========================================
        // 💾 RESET
        // ==========================================
        try {
            // Remove BOT_NAME from DB → falls back to config default
            await input('BOT_NAME', config.botName, number);

            await reply(`✅ *BOT NAME RESET*

📛 *New name:* ${config.botName}

💡 Restart bot or reload to see the change.${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
