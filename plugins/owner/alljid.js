module.exports = {
    name: 'alljid',
    aliases: ['mygroups', 'listjid'],
    category: 'owner',
    description: 'List all chats (owner only)',

    async execute(ctx) {
        const { reply, isOwner, socket, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        try {
            const chats = await socket.groupFetchAllParticipating();
            const groups = Object.values(chats);

            if (groups.length === 0) return reply(`📋 No groups found!${FOOTER}`);

            let text = `📋 *ALL GROUPS*\n\n`;
            groups.slice(0, 20).forEach((g, i) => {
                text += `${i + 1}. *${g.subject}*\n`;
                text += `   \`${g.id}\`\n`;
                text += `   👥 ${g.participants.length} members\n\n`;
            });
            text += `\n📊 Total: ${groups.length}`;

            await reply(text + FOOTER);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
