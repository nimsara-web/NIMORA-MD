const axios = require('axios');
const FormData = require('form-data');
const { downloadQuoted } = require('./_helper');

module.exports = {
    name: 'remini',
    aliases: ['enhance', 'hd'],
    category: 'convert',
    description: 'Enhance image quality',

    async execute(ctx) {
        const { reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media || media.type !== 'imageMessage') {
            return reply(`⚠️ Reply to an image!${FOOTER}`);
        }

        await reply(`✨ Enhancing... ⏳ (15-30s)${FOOTER}`);

        try {
            const form = new FormData();
            form.append('image', media.buffer, { filename: 'image.jpg' });

            const res = await axios.post('https://api.siputzx.my.id/api/iloveimg/upscale', form, {
                headers: form.getHeaders(),
                responseType: 'arraybuffer',
                timeout: 60000
            });

            const enhanced = Buffer.from(res.data);
            if (enhanced.length < 1000) return reply(`❌ Enhance failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                image: enhanced,
                caption: `✨ *Enhanced Image*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Remini failed!${FOOTER}`);
        }
    }
};
