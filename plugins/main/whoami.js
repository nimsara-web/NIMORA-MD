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
            config, senderNumber, number, msg,
            isGroup, botNumber, isBotOwner, FOOTER
        } = ctx;

        const d = _debug || {};

        // Main owners list
        const mainOwners = config.mainOwnerNumbers || [];
        const dynamicOwners = config.mainOwnerNumbers || [];

        // Status emoji helper
        const statusEmoji = (val) => val ? '✅' : '❌';
        const valOrNA = (val) => (val === undefined || val === null) ? 'N/A' : val;

        // Determine role
        let role = '👤 User';
        if (isMainOwner) role = '👑 Main Owner';
        else if (isOwner) role = '🔑 Bot Owner';

        await reply(`🔍 *PERMISSION DEBUG*

━━━━━━━━━━━━━━━━━━
👤 *IDENTITY*
• Sender: \`${d.senderNumber || senderNumber || 'unknown'}\`
• Bot: \`${d.botNumber || botNumber || number || 'unknown'}\`
• From Bot: ${statusEmoji(d.isFromBot)} ${d.isFromBot ? 'Yes' : 'No'}
• In Group: ${statusEmoji(isGroup)}

━━━━━━━━━━━━━━━━━━
🎭 *YOUR ROLE*
${role}

━━━━━━━━━━━━━━━━━━
🔑 *FINAL PERMISSIONS*
• isOwner: ${statusEmoji(isOwner)}
• isMainOwner: ${statusEmoji(isMainOwner)}
• isBotOwner: ${statusEmoji(isBotOwner || d.isSenderBotOwner)}

━━━━━━━━━━━━━━━━━━
📊 *DEBUG BREAKDOWN*
• isSenderBotOwner: ${statusEmoji(d.isSenderBotOwner)}
• isFromBotOwner: ${statusEmoji(d.isFromBotOwner)}
• isInOwnerList: ${statusEmoji(d.isInOwnerList)}
• isBotInOwnerList: ${statusEmoji(d.isBotInOwnerList)}
• senderIsMainOwner: ${statusEmoji(d.senderIsMainOwner)}
• botIsMainOwner: ${statusEmoji(d.botIsMainOwner)}
• finalIsOwner: ${statusEmoji(d.finalIsOwner)}
• finalIsMainOwner: ${statusEmoji(d.finalIsMainOwner)}

━━━━━━━━━━━━━━━━━━
🔒 *MAIN OWNERS*
${mainOwners.map(n => `• +${n}`).join('\n') || '• None'}

━━━━━━━━━━━━━━━━━━
📖 *HOW OWNER WORKS*

*Bot Owner* (🔑):
• The number that PAIRED the bot
• Can use ALL commands
• ❌ CANNOT change bot name/logo

*Main Owner* (👑):
• ${mainOwners.map(n => `+${n}`).join(', ')}
• Can use ALL commands
• ✅ CAN change bot name/logo

*User* (👤):
• Everyone else
• Only public commands

━━━━━━━━━━━━━━━━━━
📞 Contact: 0784280074${FOOTER}`);
    }
};
