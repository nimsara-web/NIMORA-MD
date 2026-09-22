module.exports = {
    name: 'deljid',
    aliases: ['delchat'],
    category: 'owner',
    description: 'Delete chat',

    async execute(ctx) {
        const { args, reply, socket, isOwner, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const target = args[0];
        if (!target) return reply(`⚠️ Usage: .deljid [JID]${FOOTER}`);

        try {
            await socket.chatModify({
                delete: true,
                lastMessages: [{ key: { remoteJid: target, id: 'msg' }, messageTimestamp: Math.floor(Date.now() / 1000) }]
            }, target);
            await reply(`✅ Chat deleted: \`${target}\`${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
