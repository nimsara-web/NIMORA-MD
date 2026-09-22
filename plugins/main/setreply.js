module.exports = {
    name: 'setreply',
    category: 'main',
    description: 'Add custom auto reply',

    async execute(ctx) {
        const { args, reply, number, isOwner, get, input, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const trigger = args[0]?.toLowerCase();
        const response = args.slice(1).join(' ');

        if (!trigger || !response) {
            return reply(`⚠️ Usage: .setreply [trigger] [response]${FOOTER}`);
        }

        const saved = await get('AUTOREPLY_LIST', number);
        let replies = {};
        try { replies = saved ? JSON.parse(saved) : {}; } catch (e) {}

        replies[trigger] = response;
        await input('AUTOREPLY_LIST', JSON.stringify(replies), number);

        await reply(`✅ Custom reply set!

🔤 *Trigger:* ${trigger}
💬 *Response:* ${response}${FOOTER}`);
    }
};
