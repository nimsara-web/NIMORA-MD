/**
 * NIMORA MD - Bot Mode
 * Category: main
 * 
 * Control bot's response mode:
 *   public  → Everyone (groups + inbox)
 *   group   → Only groups
 *   inbox   → Only inbox (DM)
 *   private → Only owner
 * 
 * OWNER ONLY (bot owner + main owner)
 */

const config = require('../../config');

module.exports = {
    name: 'mode',
    aliases: ['botmode', 'setmode'],
    category: 'main',
    description: 'Change bot mode (owner only)',

    async execute(ctx) {
        const {
            args, reply, isOwner, isMainOwner,
            get, handleSettingUpdate, number, senderNumber, FOOTER
        } = ctx;

        // ==========================================
        // 🔒 OWNER CHECK
        // ==========================================
        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        const option = args[0]?.toLowerCase();
        const validModes = ['public', 'group', 'inbox', 'private'];

        // ==========================================
        // 📊 SHOW CURRENT MODE
        // ==========================================
        if (!option || !validModes.includes(option)) {
            const current = (await get('BOT_MODE', number)) || config.defaultMode;

            return reply(`⚙️ *BOT MODE*

📊 *Current:* *${current.toUpperCase()}*

*Available Modes:*

🌐 *public* — Everyone
   Groups + Inbox

👥 *group* — Groups only
   Ignore inbox messages

📥 *inbox* — Inbox only
   Ignore group messages

🔒 *private* — Owner only
   Ignore everyone else

*Usage:*
• \`.mode public\`
• \`.mode group\`
• \`.mode inbox\`
• \`.mode private\`

💡 Only bot owner can change mode.${FOOTER}`);
        }

        // ==========================================
        // 💾 UPDATE MODE
        // ==========================================
        try {
            await handleSettingUpdate('BOT_MODE', option, reply, number);
            console.log(`[MODE] Changed to "${option}" by ${senderNumber}`);
        } catch (e) {
            console.error('[MODE] Error:', e.message);
            await reply(`❌ *Failed:* ${e.message}${FOOTER}`);
        }
    }
};
