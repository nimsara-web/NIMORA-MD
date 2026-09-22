module.exports = {
    name: 'gdp',
    aliases: ['groupdp', 'grouppp'],
    category: 'group',
    description: 'Change group profile picture',

    async execute(ctx) {
        const { reply, socket, sender, msg, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.quotedMessage?.imageMessage) {
            return reply(`⚠️ Reply to an image!${FOOTER}`);
        }

        try {
            const buffer = await ctx.downloadMediaMessage(
                { key: { remoteJid: quoted.remoteJid || sender, id: quoted.stanzaId }, message: { imageMessage: quoted.quotedMessage.imageMessage } },
                'buffer', {}, { logger: require('pino')({ level: 'silent' }) }
            );

            await socket.updateProfilePicture(sender, buffer);
            await reply(`✅ Group picture updated!${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
