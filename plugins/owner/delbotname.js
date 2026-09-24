/**
 * NIMORA MD - Delete/Reset Bot Name
 * Category: owner
 * 
 * Reset bot name to default (NIM OFFICIAL).
 * MAIN OWNER ONLY — regular owners cannot change bot name.
 */

const config = require('../../config');

module.exports = {
    name: 'delbotname',
    aliases: ['resetbotname', 'resetname', 'delname'],
    category: 'owner',
    description: 'Reset bot name to default (main owner only)',

    async execute(ctx) {
        const {
            args, reply, isMainOwner, isOwner,
            get, input, number, FOOTER
        } = ctx;

        // ==========================================
        // 🔒 STRICT MAIN OWNER CHECK
        // ==========================================
        // Only MAIN owners can reset bot name
        // Regular owners (dynamic owner list) CANNOT
        // Users who paired bot CANNOT
        if (!isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can reset the bot name.

🔒 *Main Owners:*
• +94784280074
• +94701726411

📞 Contact: 0784280074

🔍 Your status: ${isOwner ? '⚠️ Regular Owner' : '❌ Not Owner'}${FOOTER}`);
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
            await input('BOT_NAME', config.botName, number);

            await reply(`✅ *BOT NAME RESET*

📛 *New name:* ${config.botName}

💡 Bot will use default name from now on.${FOOTER}`);

            console.log(`[DELBOTNAME] ✅ Bot name reset by main owner`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
