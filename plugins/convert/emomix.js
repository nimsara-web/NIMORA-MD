const EMOJI = ['😀', '😂', '🥰', '😎', '🔥', '💯', '✨', '🌟', '💥', '🎯'];

module.exports = {
    name: 'emomix',
    aliases: ['emojimix'],
    category: 'convert',
    description: 'Mix emojis with text',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .emomix [text]${FOOTER}`);

        const mixed = text.split('').map((c, i) => i % 3 === 0 ? c + EMOJI[i % EMOJI.length] : c).join('');

        await reply(`✨ *EMOJI MIX*\n\n${mixed}${FOOTER}`);
    }
};
