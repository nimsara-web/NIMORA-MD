/**
 * NIMORA MD - Who Am I (Debug)
 * Category: main
 * 
 * Shows your permission debug info.
 */

module.exports = {
    name: 'whoami',
    aliases: ['myinfo', 'permcheck'],
    category: 'main',
    description: 'Show permission debug info',

    async execute(ctx) {
        const { reply, _debug, isOwner, isMainOwner, config, FOOTER } = ctx;
        const d = _debug || {};

        await reply(`🔍 *PERMISSION DEBUG*

👤 *Sender:* \`${d.senderNumber || 'unknown'}\`
🤖 *Bot:* \`${d.botNumber || 'unknown'}\`
📩 *From Bot:* ${d.isFromBot ? '✅ Yes' : '❌ No'}

*Permissions:*
• isOwner: ${isOwner ? '✅' : '❌'}
• isMainOwner: ${isMainOwner ? '✅' : '❌'}

*Debug Info:*
• senderIsOwner: ${d.senderIsOwner}
• senderIsMainOwner: ${d.senderIsMainOwner}
• botIsOwner: ${d.botIsOwner}
• botIsMainOwner: ${d.botIsMainOwner}

*Main Owners:*
${config.mainOwnerNumbers.map(n => `• ${n}`).join('\n')}${FOOTER}`);
    }
};
