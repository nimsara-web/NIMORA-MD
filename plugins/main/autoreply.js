module.exports = {
    name: 'autoreply',
    aliases: ['ar'],
    category: 'main',
    description: 'Manage auto-reply',

    async execute(ctx) {
        const { args, reply, number, isOwner, get, handleSettingUpdate, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const option = args[0]?.toLowerCase();
        const valid = ['all', 'inbox', 'group', 'off', 'list'];

        if (option === 'list') {
            const saved = await get('AUTOREPLY_LIST', number);
            let replies = {};
            try { replies = saved ? JSON.parse(saved) : {}; } catch (e) {}
            const triggers = Object.keys(replies);

            let text = `🤖 *AUTO-REPLY LIST*\n\n📊 Mode: *${(await get('AUTOREPLY_MODE', number) || 'off').toUpperCase()}*\n🔤 Replies: *${triggers.length}*\n\n`;
            if (triggers.length === 0) {
                text += `_No custom replies yet_\n\n💡 Add: \`.setreply [trigger] [response]\``;
            } else {
                triggers.forEach((t, i) => {
                    const preview = replies[t].length > 30 ? replies[t].substring(0, 30) + '...' : replies[t];
                    text += `${i + 1}. *${t}*\n   ↳ ${preview}\n\n`;
                });
            }
            return reply(text + FOOTER);
        }

        if (!valid.includes(option)) {
            const current = (await get('AUTOREPLY_MODE', number)) || 'off';
            return reply(`🤖 *Auto-Reply*\n\n📊 *Current:* ${current.toUpperCase()}\n\n*Options:*\n• .autoreply all\n• .autoreply inbox\n• .autoreply group\n• .autoreply off\n• .autoreply list${FOOTER}`);
        }

        await handleSettingUpdate('AUTOREPLY_MODE', option, reply, number);
    }
};
