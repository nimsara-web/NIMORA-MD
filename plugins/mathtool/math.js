module.exports = {
    name: 'math',
    aliases: ['calc', 'calculate'],
    category: 'mathtool',
    description: 'Calculate math expressions',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const expr = args.join(' ');
        if (!expr) return reply(`⚠️ Usage: .math [expression]\nExample: .math 2+2*3${FOOTER}`);

        try {
            // Safe eval - only allow math characters
            if (!/^[0-9+\-*/().%\s^]+$/.test(expr)) {
                return reply(`❌ Invalid expression! Only numbers and + - * / ( ) allowed.${FOOTER}`);
            }

            const sanitized = expr.replace(/\^/g, '**');
            const result = Function(`"use strict"; return (${sanitized})`)();

            if (!isFinite(result)) return reply(`❌ Invalid result!${FOOTER}`);

            await reply(`🧮 *MATH*\n\n📝 *Expression:* ${expr}\n✅ *Result:* ${result}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Invalid math expression!${FOOTER}`);
        }
    }
};
