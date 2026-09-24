/**
 * NIMORA MD - Who Am I (Debug)
 * Category: main
 * 
 * Shows your permission debug info.
 * Useful for testing owner access.
 */

module.exports = {
    name: 'whoami',
    aliases: ['myinfo', 'permcheck', 'debugperm'],
    category: 'main',
    description: 'Show permission debug info',

    async execute(ctx) {
        const {
            reply, _debug, isOwner, isMainOwner,
            config, senderNumber, number, msg, FOOTER
        } = ctx;

        const d = _debug || {};

        // Check if user is owner list
        const isInOwnerList = config.mainOwnerNumbers.includes(senderNumber);
        const dynamicOwners = config.mainOwnerNumbers || [];

        const statusEmoji = (val) => val ? '✅' : '❌';

        await reply(`🔍 *PERMISSION DEBUG*

━━━━━━━━━━━━━━━━━━
👤 *IDENTITY*
• Sender: \`${d.senderNumber || senderNumber || 'unknown'}\`
• Bot: \`${d.botNumber || number || 'unknown'}\`
• From Bot: ${statusEmoji(d.isFromBot)} ${d.isFromBot ? 'Yes' : 'No'}
• In Group: ${statusEmoji(ctx.isGroup)}

━━━━━━━━━━━━━━━━━━
🔑 *FINAL PERMISSIONS*
• isOwner: ${statusEmoji(isOwner)}
• isMainOwner: ${statusEmoji(isMainOwner)}

━━━━━━━━━━━━━━━━━━
📊 *DEBUG BREAKDOWN*
• senderIsOwner: ${statusEmoji(d.senderIsOwner)}
• senderIsMainOwner: ${statusEmoji(d.senderIsMainOwner)}
• botIsOwner: ${statusEmoji(d.botIsOwner)}
• botIsMainOwner: ${statusEmoji(d.botIsMainOwner)}

━━━━━━━━━━━━━━━━━━
🔒 *MAIN OWNERS*
${dynamicOwners.map(n => `• +${n}`).join('\n') || '• None'}

━━━━━━━━━━━━━━━━━━
💡 *How this works:*
You are owner IF:
• Your number is in OWNER_LIST
• OR you're the main owner

⚠️ *Note:* Pairing the bot does NOT make you owner.

📞 Contact: 0784280074${FOOTER}`);
    }
};
