module.exports = {
    name: 'setbotname',
    aliases: ['setname', 'botname'],
    category: 'owner',
    description: 'Change bot name (main owner only)',

    async execute(ctx) {
        const { args, reply, isMainOwner, get, handleSettingUpdate, number, FOOTER } = ctx;

        // 🔒 MAIN OWNER ONLY
        if (!isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can change bot name.

📞 Contact: 0784280074${FOOTER}`);
        }

        const newName = args.join(' ').trim();
        if (!newName) {
            const current = await get('BOT_NAME', number) || 'NIM OFFICIAL';
            return reply(`📛 *BOT NAME SETTINGS*\n\n📊 *Current:* ${current}\n\n*Usage:* \`.setbotname [name]\`${FOOTER}`);
        }

        if (newName.length > 30) {
            return reply(`⚠️ *Name too long!* (max 30)${FOOTER}`);
        }

        await handleSettingUpdate('BOT_NAME', newName, reply, number);
    }
};
