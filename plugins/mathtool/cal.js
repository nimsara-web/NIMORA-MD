module.exports = {
    name: 'cal',
    aliases: ['calculator'],
    category: 'mathtool',
    description: 'Interactive calculator',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const expr = args.join(' ');
        if (!expr) {
            return reply(`🧮 *CALCULATOR*

*Usage:* .cal [expression]

*Examples:*
• .cal 2+2
• .cal 10*5
• .cal (5+3)/2
• .cal 2^10

💡 For advanced: .mathstep${FOOTER}`);
        }

        try {
            if (!/^[0-9+\-*/().%\s^]+$/.test(expr)) {
                return reply(`❌ Invalid input!${FOOTER}`);
            }
            const sanitized = expr.replace(/\^/g, '**');
            const result = Function(`"use strict"; return (${sanitized})`)();

            if (!isFinite(result)) return reply(`❌ Invalid!${FOOTER}`);

            await reply(`🧮 ${expr} = *${result}*${FOOTER}`);
        } catch (e) {
            await reply(`❌ Invalid expression!${FOOTER}`);
        }
    }
};
