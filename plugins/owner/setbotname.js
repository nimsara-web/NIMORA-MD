/**
 * NIMORA MD - Set Bot Name
 * Category: owner
 * 
 * Change the bot's display name (stored in DB).
 * Owner-only command.
 */

module.exports = {
    name: 'setbotname',
    aliases: ['setname', 'botname'],
    category: 'owner',
    description: 'Change bot name',

    async execute(ctx) {
        const {
            args, reply, isOwner, isMainOwner,
            get, handleSettingUpdate, number, FOOTER
        } = ctx;

        // ==========================================
        // 🔑 OWNER CHECK
        // ==========================================
        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only bot owners can change the bot name.

📞 Contact: 0784280074${FOOTER}`);
        }

        // ==========================================
        // 📝 GET NEW NAME
        // ==========================================
        const newName = args.join(' ').trim();

        // If no name → show current + usage
        if (!newName) {
            const currentName = await get('BOT_NAME', number) || 'NIMORA MD';
            return reply(`📛 *BOT NAME SETTINGS*

📊 *Current:* ${currentName}

*Usage:* \`.setbotname [new name]\`
*Example:* \`.setbotname NIMORA MD\`${FOOTER}`);
        }

        // ==========================================
        // ⚠️ LENGTH CHECK
        // ==========================================
        if (newName.length > 30) {
            return reply(`⚠️ *Name too long!*

📏 Max: 30 characters
📝 Yours: ${newName.length}${FOOTER}`);
        }

        // ==========================================
        // 💾 SAVE
        // ==========================================
        try {
            await handleSettingUpdate('BOT_NAME', newName, reply, number);
        } catch (e) {
            await reply(`❌ Failed to save: ${e.message}${FOOTER}`);
        }
    }
};
