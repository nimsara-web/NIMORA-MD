/**
 * NIMORA MD - Set Bot Name
 * Category: owner
 * 
 * Change the bot's display name.
 * MAIN OWNER ONLY.
 * 
 * Bot owner (who paired) → ❌ Cannot use
 * Main owner (94784280074) → ✅ Can use
 */

module.exports = {
    name: 'setbotname',
    aliases: ['setname', 'botname'],
    category: 'owner',
    description: 'Change bot name (main owner only)',

    async execute(ctx) {
        const {
            args, reply, isMainOwner, isOwner,
            get, handleSettingUpdate, number,
            config, FOOTER
        } = ctx;

        // ==========================================
        // 🔒 STRICT MAIN OWNER CHECK
        // ==========================================
        if (!isMainOwner) {
            const mainOwners = (config.mainOwnerNumbers || [])
                .map(n => `• +${n}`).join('\n') || '• 94784280074';

            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can change the bot name.

🔒 *Main Owners:*
${mainOwners}

📞 Contact: 0784280074

🔍 *Your status:*
• isOwner: ${isOwner ? '✅' : '❌'}
• isMainOwner: ${isMainOwner ? '✅' : '❌'}

💡 Bot owner (paired) cannot change name.
⚠️ Only main owner can change.${FOOTER}`);
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

        // ==========================================
        // ⚠️ VALIDATION
        // ==========================================
        if (newName.length > 30) {
            return reply(`⚠️ *Name too long!*

📏 Max: 30 characters
📝 Yours: ${newName.length}${FOOTER}`);
        }

        if (newName.length < 2) {
            return reply(`⚠️ *Name too short!*

📏 Min: 2 characters${FOOTER}`);
        }

        // ==========================================
        // 💾 SAVE
        // ==========================================
        try {
            await handleSettingUpdate('BOT_NAME', newName, reply, number);
            console.log(`[SETBOTNAME] ✅ Bot name changed to: "${newName}" by ${ctx.senderNumber}`);
        } catch (e) {
            console.error(`[SETBOTNAME] Error:`, e.message);
            await reply(`❌ *Failed to save!*

📝 Error: ${e.message}

💡 Try again or contact support.${FOOTER}`);
        }
    }
};
