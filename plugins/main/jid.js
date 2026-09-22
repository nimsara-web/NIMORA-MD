module.exports = {
    name: 'jid',
    aliases: ['chatid'],
    category: 'main',
    description: 'Show JID info',

    async execute(ctx) {
        const { msg, reply, FOOTER } = ctx;

        const chatJid = msg.key.remoteJid;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const quotedJid = msg.message?.extendedTextMessage?.contextInfo?.participant || 'None';

        await reply(`📍 *JID INFORMATION*

💬 *Chat JID:* \`${chatJid}\`
👤 *Sender JID:* \`${senderJid}\`
💭 *Quoted JID:* \`${quotedJid}\`${FOOTER}`);
    }
};
