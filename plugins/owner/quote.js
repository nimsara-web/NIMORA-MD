const QUOTES = [
    "The only way to do great work is to love what you do. — Steve Jobs",
    "Innovation distinguishes between a leader and a follower. — Steve Jobs",
    "Life is what happens when you're busy making other plans. — John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. — Aristotle",
    "Don't watch the clock; do what it does. Keep going. — Sam Levenson"
];

module.exports = {
    name: 'quote',
    aliases: ['q'],
    category: 'owner',
    description: 'Random quote',

    async execute(ctx) {
        const { reply, isOwner, FOOTER } = ctx;
        const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        await reply(`💭 *QUOTE*\n\n${q}${FOOTER}`);
    }
};
