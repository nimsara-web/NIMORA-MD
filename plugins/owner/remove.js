module.exports = {
    name: 'remove',
    aliases: ['delmsg', 'revoke'],
    category: 'owner',
    description: 'Delete a message (reply)',

    async execute(ctx) {
        const { reply, socket, msg, isOwner, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.stanzaId) return reply(`⚠️ Reply to a message to delete!${FOOTER}`);

        try {
            await socket.sendMessage(quoted.remoteJid || ctx.sender, {
                delete: {
                    remoteJid: quoted.remoteJid || ctx.sender,
                    fromMe: quoted.participant === socket.user.id || false,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                }
            });
            await reply(`✅ Message deleted!${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
