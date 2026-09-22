const axios = require('axios');

module.exports = {
    name: 'mathstep',
    aliases: ['stepmath'],
    category: 'mathtool',
    description: 'Solve math with steps',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const expr = args.join(' ');
        if (!expr) return reply(`⚠️ Usage: .mathstep [equation]${FOOTER}`);

        await reply(`🧮 Solving... ⏳${FOOTER}`);

        try {
            // Use Wolfram Alpha free-ish endpoint
            const res = await axios.get(`https://api.mathjs.org/v4/?expr=${encodeURIComponent(expr)}`, { timeout: 15000 });
            const result = res.data;

            await reply(`🧮 *MATH STEP SOLVER*

📝 *Input:* ${expr}
✅ *Result:* ${result}

💡 For detailed steps, try:
• .ai solve step by step: ${expr}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Solve failed!${FOOTER}`);
        }
    }
};
