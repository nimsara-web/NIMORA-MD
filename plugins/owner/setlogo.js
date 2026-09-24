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
            args, reply, isMainOwner,
            get, input, number, FOOTER
        } = ctx;

        // 🔒 MAIN OWNER ONLY
        if (!isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can change bot logo.

📞 Contact: 0784280074${FOOTER}`);
        }

        const logoUrl = args[0];

        if (!logoUrl) {
            const current = await get('BOT_LOGO', number) || config.botImageUrl;
            return reply(`🖼️ *BOT LOGO SETTINGS*

📊 *Current:* ${current ? '✅ Set' : '❌ Not set'}

*Usage:* \`.setlogo [image_url]\`

💡 Must be a direct image URL
• https://example.com/logo.jpg
• https://i.ibb.co/xxx/logo.png${FOOTER}`);
        }

        if (!logoUrl.startsWith('http')) {
            return reply(`❌ *Invalid URL!*

💡 Must start with http:// or https://${FOOTER}`);
        }

        // Validate image URL
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.jfif'];
        const lowerUrl = logoUrl.toLowerCase();
        const isValid = validExtensions.some(ext => lowerUrl.includes(ext)) ||
                        lowerUrl.includes('github') ||
                        lowerUrl.includes('ibb.co') ||
                        lowerUrl.includes('catbox');

        if (!isValid) {
            return reply(`⚠️ *URL might not be an image*

💡 Continue anyway? Send:
\`.setlogo ${logoUrl} force\``);
        }

        await input('BOT_LOGO', logoUrl, number);
        await reply(`✅ *Bot logo updated!*

🖼️ *URL:* ${logoUrl}

💡 Restart bot to see change.${FOOTER}`);
    }
};
