/**
 * NIMORA MD - Set Bot Logo
 * Category: owner
 * 
 * Change bot logo URL.
 * MAIN OWNER ONLY.
 */

const config = require('../../config');

module.exports = {
    name: 'setlogo',
    aliases: ['botlogo', 'setbotlogo'],
    category: 'owner',
    description: 'Set bot logo URL (main owner only)',

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

💡 Only MAIN bot owner can change the bot logo.

🔒 *Main Owners:*
${mainOwners}

📞 Contact: 0784280074

🔍 *Your status:*
• isOwner: ${isOwner ? '✅' : '❌'}
• isMainOwner: ${isMainOwner ? '✅' : '❌'}${FOOTER}`);
        }

        const logoUrl = args[0];

        // ==========================================
        // 📊 SHOW CURRENT (no URL)
        // ==========================================
        if (!logoUrl) {
            const current = await get('BOT_LOGO', number) || config.botImageUrl;
            return reply(`🖼️ *BOT LOGO SETTINGS*

📊 *Current:* ${current ? '✅ Set' : '❌ Not set'}

*Usage:* \`.setlogo [image_url]\`

💡 *Direct image URL:*
• https://example.com/logo.jpg
• https://i.ibb.co/xxx/logo.png
• https://github.com/.../logo.png${FOOTER}`);
        }

        // ==========================================
        // ⚠️ VALIDATION
        // ==========================================
        if (!logoUrl.startsWith('http')) {
            return reply(`❌ *Invalid URL!*

💡 Must start with http:// or https://${FOOTER}`);
        }

        // ==========================================
        // 💾 SAVE
        // ==========================================
        try {
            await input('BOT_LOGO', logoUrl, number);
            await reply(`✅ *Bot logo updated!*

🖼️ *URL:* ${logoUrl}

💡 Restart bot to see the change.${FOOTER}`);

            console.log(`[SETLOGO] ✅ Logo changed by ${ctx.senderNumber}`);
        } catch (e) {
            console.error(`[SETLOGO] Error:`, e.message);
            await reply(`❌ *Failed:* ${e.message}${FOOTER}`);
        }
    }
};
