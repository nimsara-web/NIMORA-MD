/**
 * NIMORA MD - Delete/Reset Bot Name
 * Category: owner
 * 
 * Reset bot name to default (NIM OFFICIAL).
 * MAIN OWNER ONLY.
 */

const config = require('../../config');

module.exports = {
    name: 'delbotname',
    aliases: ['resetbotname', 'resetname', 'delname'],
    category: 'owner',
    description: 'Reset bot name (main owner only)',

    async execute(ctx) {
        const {
            args, reply, isMainOwner, isOwner,
            get, input, number, FOOTER
        } = ctx;

        // ==========================================
        // 🔒 STRICT MAIN OWNER CHECK
        // ==========================================
        if (!isMainOwner) {
            const mainOwners = (config.mainOwnerNumbers || [])
                .map(n => `• +${n}`).join('\n') || '• 94784280074';

            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can reset the bot name.

🔒 *Main Owners:*
${mainOwners}

📞 Contact: 0784280074

🔍 *Your status:*
• isOwner: ${isOwner ? '✅' : '❌'}
• isMainOwner: ${isMainOwner ? '✅' : '❌'}${FOOTER}`);
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

            console.log(`[DELBOTNAME] ✅ Bot name reset by ${ctx.senderNumber}`);
        } catch (e) {
            console.error(`[DELBOTNAME] Error:`, e.message);
            await reply(`❌ *Failed:* ${e.message}${FOOTER}`);
        }
    }
};
