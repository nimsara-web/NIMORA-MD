module.exports = {
    name: 'getpp',
    aliases: ['pp', 'profilepic'],
    category: 'owner',
    description: 'Get user profile picture',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, isOwner, channelContext, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let targetJid;

        if (quoted?.participant) {
            targetJid = quoted.participant;
        } else if (args[0]) {
            const num = args[0].replace(/[^0-9]/g, '');
            targetJid = `${num}@s.whatsapp.net`;
        } else {
            return reply(`⚠️ Reply to a user or provide a number!${FOOTER}`);
        }

        try {
            const url = await socket.profilePictureUrl(targetJid, 'image');
            await socket.sendMessage(sender, {
                image: { url },
                caption: `🖼️ *Profile Picture*\n\n👤 ${targetJid.split('@')[0]}${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Profile pic not available!${FOOTER}`);
        }
    }
};
