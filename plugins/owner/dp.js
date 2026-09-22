module.exports = {
    name: 'dp',
    aliases: ['setpp', 'setprofilepic'],
    category: 'owner',
    description: 'Set bot profile picture',

    async execute(ctx) {
        const { reply, socket, msg, isOwner, getMediaType, unwrapMessage, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.quotedMessage) return reply(`⚠️ Reply to an image!${FOOTER}`);

        const qMsg = unwrapMessage(quoted.quotedMessage);
        const mediaInfo = getMediaType(qMsg);
        if (!mediaInfo || mediaInfo.type !== 'imageMessage') {
            return reply(`⚠️ Reply to an image!${FOOTER}`);
        }

        try {
            const buffer = await ctx.downloadMediaMessage(
                { key: { remoteJid: quoted.remoteJid || ctx.sender, id: quoted.stanzaId, participant: quoted.participant }, message: { imageMessage: mediaInfo.data } },
                'buffer', {}, { logger: require('pino')({ level: 'silent' }) }
            );

            const botJid = socket.user.id.split(':')[0] + '@s.whatsapp.net';
            await socket.updateProfilePicture(botJid, buffer);
            await reply(`✅ *Profile picture updated!*${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
