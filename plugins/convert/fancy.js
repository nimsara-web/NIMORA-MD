const FANCY_MAP = {
    'a': 'α', 'b': 'в', 'c': '¢', 'd': '∂', 'e': 'є', 'f': 'ƒ', 'g': 'g',
    'h': 'н', 'i': 'ι', 'j': 'נ', 'k': 'к', 'l': 'ℓ', 'm': 'м', 'n': 'η',
    'o': 'σ', 'p': 'ρ', 'q': 'q', 'r': 'я', 's': 'ѕ', 't': 'т', 'u': 'υ',
    'v': 'ν', 'w': 'ω', 'x': 'χ', 'y': 'у', 'z': 'z',
    'A': 'α', 'B': 'в', 'C': '¢', 'D': '∂', 'E': 'є', 'F': 'ƒ', 'G': 'g',
    'H': 'н', 'I': 'ι', 'J': 'נ', 'K': 'к', 'L': 'ℓ', 'M': 'м', 'N': 'η',
    'O': 'σ', 'P': 'ρ', 'Q': 'q', 'R': 'я', 'S': 'ѕ', 'T': 'т', 'U': 'υ',
    'V': 'ν', 'W': 'ω', 'X': 'χ', 'Y': 'у', 'Z': 'z'
};

module.exports = {
    name: 'fancy',
    aliases: ['fancytext', 'styletext'],
    category: 'convert',
    description: 'Fancy text converter',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .fancy [text]${FOOTER}`);

        const fancy = text.split('').map(c => FANCY_MAP[c] || c).join('');

        await reply(`✨ *FANCY TEXT*\n\n${fancy}${FOOTER}`);
    }
};
