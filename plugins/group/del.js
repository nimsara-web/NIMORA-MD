module.exports = {
    name: 'del',
    aliases: ['delete'],
    category: 'group',
    description: 'Delete a message',

    async execute(ctx) {
        const { reply, socket, msg, sender, FOOTER } = ctx;

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.stanzaId) return reply(`⚠️ Reply to a message!${FOOTER}`);

        try {
            await socket.sendMessage(sender, {
                delete: {
                    remoteJid: sender,
                    fromMe: false,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                }
            });
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
