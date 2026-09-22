const util = require('util');

module.exports = {
    name: 'eval',
    aliases: ['ev', 'run'],
    category: 'owner',
    description: 'Execute JS (owner only)',

    async execute(ctx) {
        const { args, reply, isOwner, isMainOwner, FOOTER, _debug } = ctx;

        // ==========================================
        // 🔑 OWNER CHECK (both owner AND main owner)
        // ==========================================
        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*

💡 This command is only for bot owners.

🔍 *Debug:*
• Your ID: ${_debug?.senderNumber || 'unknown'}
• Bot ID: ${_debug?.botNumber || 'unknown'}
• From Bot: ${_debug?.isFromBot ? '✅' : '❌'}${FOOTER}`);
        }

        const code = args.join(' ');
        if (!code) return reply(`⚠️ Usage: .eval [code]${FOOTER}`);

        try {
            let result = await eval(`(async () => { ${code} })()`);
            if (typeof result !== 'string') result = util.inspect(result, { depth: 2 });
            if (result && result.length > 3500) result = result.substring(0, 3500) + '...';

            await reply(`✅ *EVAL RESULT*\n\n\`\`\`\n${result}\n\`\`\`${FOOTER}`);
        } catch (e) {
            await reply(`❌ *EVAL ERROR*\n\n\`\`\`\n${e.message}\n\`\`\`${FOOTER}`);
        }
    }
};
