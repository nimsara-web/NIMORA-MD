module.exports = {
    name: 'theme',
    category: 'owner',
    description: 'Change bot theme',

    async execute(ctx) {
        const { args, reply, isOwner, handleSettingUpdate, number, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const theme = args[0]?.toLowerCase();
        const themes = ['red', 'blue', 'green', 'purple', 'gold'];

        if (!theme || !themes.includes(theme)) {
            return reply(`🎨 *THEME SETTINGS*

📊 *Available:* ${themes.join(', ')}

*Usage:* .theme [color]

💡 Current theme is *RED* (NIMORA default)${FOOTER}`);
        }

        await handleSettingUpdate('BOT_THEME', theme, reply, number);
    }
};
