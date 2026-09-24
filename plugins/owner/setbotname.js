/**
 * NIMORA MD - Set Bot Name
 * Category: owner
 * 
 * Change the bot's display name.
 * MAIN OWNER ONLY.
 */

module.exports = {
    name: 'setbotname',
    aliases: ['setname', 'botname'],
    category: 'owner',
    description: 'Change bot name (main owner only)',

    async execute(ctx) {
        const {
            args, reply, isMainOwner, isOwner,
            get, handleSettingUpdate, number, FOOTER
        } = ctx;

        // ==========================================
        // 🔒 STRICT MAIN OWNER CHECK
        // ==========================================
        if (!isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can change the bot name.

🔒 *Main Owners:*
• +94784280074
• +94701726411

📞 Contact: 0784280074

🔍 Your status: ${isOwner ? '⚠️ Regular Owner' : '❌ Not Owner'}${FOOTER}`);
        }

        // ==========================================
        // 📝 GET NEW NAME
        // ==========================================
        const newName = args.join(' ').trim();

        if (!newName) {
            const currentName = await get('BOT_NAME', number) || 'NIM OFFICIAL';
            return reply(`📛 *BOT NAME SETTINGS*

📊 *Current:* ${currentName}

*Usage:* \`.setbotname [new name]\`
*Example:* \`.setbotname NIM OFFICIAL\`${FOOTER}`);
        }

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
            console.log(`[SETBOTNAME] ✅ Bot name changed to: ${newName}`);
        } catch (e) {
            await reply(`❌ Failed to save: ${e.message}${FOOTER}`);
        }
    }
};
