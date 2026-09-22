module.exports = {
    name: 'enc',
    aliases: ['encrypt'],
    category: 'owner',
    description: 'Base64 encode',

    async execute(ctx) {
        const { args, reply, isOwner, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .enc [text]${FOOTER}`);

        const encoded = Buffer.from(text).toString('base64');
        await reply(`🔐 *ENCODED*\n\n\`${encoded}\`${FOOTER}`);
    }
};
