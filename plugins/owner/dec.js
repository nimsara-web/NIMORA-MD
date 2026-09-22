module.exports = {
    name: 'dec',
    aliases: ['decrypt'],
    category: 'owner',
    description: 'Base64 decode',

    async execute(ctx) {
        const { args, reply, isOwner, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .dec [encoded]${FOOTER}`);

        try {
            const decoded = Buffer.from(text, 'base64').toString('utf8');
            await reply(`🔓 *DECODED*\n\n${decoded}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Invalid base64!${FOOTER}`);
        }
    }
};
