module.exports = {
    name: 'delreply',
    aliases: ['removereply'],
    category: 'main',
    description: 'Remove custom reply',

    async execute(ctx) {
        const { args, reply, number, isOwner, get, input, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const trigger = args[0]?.toLowerCase();
        if (!trigger) return reply(`⚠️ Usage: .delreply [trigger]${FOOTER}`);

        const saved = await get('AUTOREPLY_LIST', number);
        let replies = {};
        try { replies = saved ? JSON.parse(saved) : {}; } catch (e) {}

        if (!replies[trigger]) return reply(`❌ Trigger not found: *${trigger}*${FOOTER}`);

        delete replies[trigger];
        await input('AUTOREPLY_LIST', JSON.stringify(replies), number);

        await reply(`✅ Removed: *${trigger}*${FOOTER}`);
    }
};
