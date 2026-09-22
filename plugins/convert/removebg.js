const axios = require('axios');
const FormData = require('form-data');
const { downloadQuoted } = require('./_helper');

module.exports = {
    name: 'removebg',
    aliases: ['rbg', 'nobg'],
    category: 'convert',
    description: 'Remove image background',

    async execute(ctx) {
        const { reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const media = await downloadQuoted(ctx);
        if (!media || media.type !== 'imageMessage') {
            return reply(`⚠️ Reply to an image!${FOOTER}`);
        }

        await reply(`✂️ Removing background... ⏳${FOOTER}`);

        try {
            const form = new FormData();
            form.append('image_file', media.buffer, { filename: 'image.jpg' });

            const res = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
                headers: { ...form.getHeaders(), 'X-Api-Key': 'DEMO_KEY' },
                responseType: 'arraybuffer',
                timeout: 60000
            }).catch(() => null);

            // Fallback: use siputzx
            let processed = null;
            if (res?.data) {
                processed = Buffer.from(res.data);
            } else {
                const form2 = new FormData();
                form2.append('image', media.buffer, { filename: 'image.jpg' });
                const res2 = await axios.post('https://api.siputzx.my.id/api/iloveimg/removebg', form2, {
                    headers: form2.getHeaders(),
                    responseType: 'arraybuffer',
                    timeout: 60000
                });
                processed = Buffer.from(res2.data);
            }

            if (!processed || processed.length < 500) return reply(`❌ Remove BG failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                image: processed,
                caption: `✂️ *Background Removed*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Remove BG failed!${FOOTER}`);
        }
    }
};
