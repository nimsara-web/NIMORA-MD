module.exports = {
    name: 'trt',
    aliases: ['transliterate', 'singlish'],
    category: 'convert',
    description: 'Singlish → Sinhala transliterate',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .trt [singlish text]${FOOTER}`);

        // Basic singlish to sinhala map
        const map = {
            'a': 'අ', 'aa': 'ආ', 'i': 'ඉ', 'ii': 'ඊ', 'u': 'උ', 'uu': 'ඌ',
            'e': 'එ', 'ee': 'ඒ', 'o': 'ඔ', 'oo': 'ඕ',
            'ka': 'ක', 'kha': 'ඛ', 'ga': 'ග', 'gha': 'ඝ',
            'cha': 'ච', 'ja': 'ජ', 'jha': 'ඣ',
            'ta': 'ට', 'tha': 'ත', 'da': 'ඩ', 'dha': 'ධ',
            'na': 'න', 'pa': 'ප', 'pha': 'ඵ', 'ba': 'බ',
            'bha': 'භ', 'ma': 'ම', 'ya': 'ය', 'ra': 'ර',
            'la': 'ල', 'va': 'ව', 'wa': 'ව', 'sha': 'ශ',
            'sa': 'ස', 'ha': 'හ', 'lla': 'ළ'
        };

        let result = text.toLowerCase();
        const sorted = Object.keys(map).sort((a, b) => b.length - a.length);
        sorted.forEach(key => {
            result = result.replace(new RegExp(key, 'g'), map[key]);
        });

        await reply(`✍️ *TRANSLITERATED*\n\n${result}${FOOTER}`);
    }
};
