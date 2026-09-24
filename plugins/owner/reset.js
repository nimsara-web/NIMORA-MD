/**
 * NIMORA MD - Reset Command
 * Category: owner
 * 
 * Reset all bot settings to default.
 * MAIN OWNER ONLY.
 * 
 * ⚠️ This does NOT delete sessions or owner list.
 */

const config = require('../../config');

module.exports = {
    name: 'reset',
    aliases: ['resetall'],
    category: 'owner',
    description: 'Reset all bot settings (main owner only)',

    async execute(ctx) {
        const {
            args, reply, isMainOwner, isOwner,
            number, input, senderNumber, FOOTER
        } = ctx;

        // ==========================================
        // 🔒 MAIN OWNER ONLY
        // ==========================================
        if (!isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can reset settings.

📞 Contact: 0784280074

🔍 *Your status:*
• isOwner: ${isOwner ? '✅' : '❌'}
• isMainOwner: ${isMainOwner ? '✅' : '❌'}${FOOTER}`);
        }

        // ==========================================
        // ⚠️ CONFIRMATION
        // ==========================================
        const confirm = args[0]?.toLowerCase();
        if (confirm !== 'confirm') {
            return reply(`⚠️ *DANGER — CONFIRM RESET*

🎯 This will reset ALL settings to default:
• Prefix → \`.\`
• Bot Name → \`${config.botName}\`
• Bot Mode → \`public\`
• Auto View → ON
• Auto Like → ON
• Auto Reply → OFF
• Welcome → OFF
• Anti-Link → OFF
• Always Online → ON

⚠️ *NOT affected:*
• Owner list (safe)
• Sessions (safe)
• Notes
• Custom replies

*Usage:* \`.reset confirm\`${FOOTER}`);
        }

        // ==========================================
        // 🔄 RESET SETTINGS
        // ==========================================
        const keysToReset = [
            { key: 'PREFIX', value: config.defaultPrefix },
            { key: 'BOT_NAME', value: config.botName },
            { key: 'BOT_MODE', value: 'public' },
            { key: 'AUTO_VIEW_STATUS', value: 'true' },
            { key: 'AUTO_LIKE_STATUS', value: 'true' },
            { key: 'ALWAYS_ONLINE', value: 'true' },
            { key: 'AUTOREPLY_MODE', value: 'off' },
            { key: 'AUTOREPLY_LIST', value: '{}' },
            { key: 'VVSAVE_AUTO', value: 'off' },
            { key: 'STATUS_AUTO', value: 'off' }
        ];

        let successCount = 0;
        let failCount = 0;

        for (const { key, value } of keysToReset) {
            try {
                await input(key, value, number);
                successCount++;
            } catch (e) {
                console.error(`[RESET] Failed to reset ${key}:`, e.message);
                failCount++;
            }
        }

        console.log(`[RESET] ✅ By ${senderNumber} - ${successCount} success, ${failCount} failed`);

        await reply(`✅ *SETTINGS RESET COMPLETE!*

📊 *Results:*
• ✅ Reset: ${successCount}
• ❌ Failed: ${failCount}

🔒 *Preserved:*
• Owner list
• Sessions
• Notes
• Custom replies

💡 Restart bot to apply all changes.${FOOTER}`);
    }
};
