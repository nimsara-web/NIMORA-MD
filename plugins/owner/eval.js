const util = require('util');

module.exports = {
    name: 'eval',
    aliases: ['ev', 'run'],
    category: 'owner',
    description: 'Execute JS (main owner only)',

    async execute(ctx) {
        const { args, reply, isMainOwner, FOOTER } = ctx;
        if (!isMainOwner) return reply(`⚠️ *Main Owner Only!*${FOOTER}`);

        const code = args.join(' ');
        if (!code) return reply(`⚠️ Usage: .eval [code]${FOOTER}`);

        try {
            let result = await eval(`(async () => { ${code} })()`);
            if (typeof result !== 'string') result = util.inspect(result, { depth: 2 });
            if (result.length > 3500) result = result.substring(0, 3500) + '...';

            await reply(`✅ *EVAL RESULT*\n\n\`\`\`\n${result}\n\`\`\`${FOOTER}`);
        } catch (e) {
            await reply(`❌ *EVAL ERROR*\n\n\`\`\`\n${e.message}\n\`\`\`${FOOTER}`);
        }
    }
};
