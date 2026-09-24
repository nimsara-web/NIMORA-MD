/**
 * NIMORA MD - Eval Command
 * Category: owner
 * 
 * Execute JavaScript code (dangerous).
 * 
 * Access:
 *   ✅ Bot Owner (paired number)
 *   ✅ Main Owner (94784280074)
 *   ❌ Regular users
 */

const util = require('util');

module.exports = {
    name: 'eval',
    aliases: ['ev', 'run'],
    category: 'owner',
    description: 'Execute JavaScript code (owner only)',

    async execute(ctx) {
        const {
            args, reply, isOwner, isMainOwner,
            senderNumber, number, FOOTER, _debug
        } = ctx;

        // ==========================================
        // 🔑 OWNER CHECK (bot owner OR main owner)
        // ==========================================
        if (!isOwner && !isMainOwner) {
            const d = _debug || {};
            return reply(`⚠️ *Access Denied!*

💡 This command is only for bot owners.

🔍 *Your info:*
• Sender: ${d.senderNumber || senderNumber || 'unknown'}
• Bot: ${d.botNumber || number || 'unknown'}
• isOwner: ${isOwner ? '✅' : '❌'}
• isMainOwner: ${isMainOwner ? '✅' : '❌'}

📞 Contact: 0784280074${FOOTER}`);
        }

        const code = args.join(' ');
        if (!code) {
            return reply(`⚠️ *Usage:* \`.eval [code]\`

*Examples:*
• \`.eval 1+1\`
• \`.eval console.log('hi')\`
• \`.eval process.version\`

⚠️ *Warning:* Only owners can use this!${FOOTER}`);
        }

        // ==========================================
        // 🚀 EXECUTE
        // ==========================================
        try {
            let result = await eval(`(async () => { ${code} })()`);

            // Format result
            if (typeof result !== 'string') {
                result = util.inspect(result, { depth: 2 });
            }

            if (result && result.length > 3500) {
                result = result.substring(0, 3500) + '\n... [truncated]';
            }

            if (!result || result === 'undefined') {
                result = '(no output)';
            }

            await reply(`✅ *EVAL RESULT*

\`\`\`
${result}
\`\`\`

👤 *By:* ${isMainOwner ? '👑 Main Owner' : '🔑 Owner'}${FOOTER}`);

            console.log(`[EVAL] ✅ Executed by ${senderNumber}: ${code.substring(0, 50)}`);

        } catch (e) {
            console.error(`[EVAL] ❌ Error:`, e.message);

            await reply(`❌ *EVAL ERROR*

\`\`\`
${e.message}
\`\`\`

👤 *By:* ${isMainOwner ? '👑 Main Owner' : '🔑 Owner'}${FOOTER}`);
        }
    }
};
