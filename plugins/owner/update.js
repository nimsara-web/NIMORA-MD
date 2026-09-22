module.exports = {
    name: 'update',
    aliases: ['upd'],
    category: 'owner',
    description: 'Check for updates',

    async execute(ctx) {
        const { reply, isOwner, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        await reply(`🔄 *BOT UPDATE*

✅ Version: *1.0.0*
📅 Last Updated: ${new Date().toLocaleDateString()}
📦 Node: ${process.version}

💡 To update:
1. Pull latest code from GitHub
2. Restart bot: \`.restart\`

💡 New features coming soon!${FOOTER}`);
    }
};
