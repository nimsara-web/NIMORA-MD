const axios = require('axios');
const config = require('../../config');

async function generateImage(prompt) {
    // Try NIM API
    try {
        const res = await axios.get(`${config.nimApiBase}/api/ai/imagine?apiKey=${config.nimApiKey}&prompt=${encodeURIComponent(prompt)}`, { timeout: 60000 });
        const url = res.data?.result?.url || res.data?.data?.url || res.data?.url || res.data?.result;
        if (url && typeof url === 'string' && url.startsWith('http')) return url;
    } catch (e) {}

    // Fallback
    const apis = [
        { url: `https://api.siputzx.my.id/api/ai/stable-diffusion?prompt=${encodeURIComponent(prompt)}`, extract: d => d?.data?.url || d?.result || d?.url },
        { url: `https://api.nekosia.cat/api/v1/images/text2image?prompt=${encodeURIComponent(prompt)}`, extract: d => d?.image?.url || d?.url }
    ];

    for (const api of apis) {
        try {
            const res = await axios.get(api.url, { timeout: 45000 });
            const url = api.extract(res.data);
            if (url && url.startsWith('http')) return url;
        } catch (e) {}
    }
    return null;
}

module.exports = {
    name: 'imagine',
    aliases: ['aiimage', 'imggen', 'generate'],
    category: 'ai',
    description: 'Generate AI image from prompt',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const prompt = args.join(' ');
        if (!prompt) return reply(`⚠️ Usage: .imagine [description]${FOOTER}`);

        await reply(`🎨 Generating image... ⏳ (this may take 15-30s)${FOOTER}`);

        const imageUrl = await generateImage(prompt);
        if (!imageUrl) return reply(`❌ Image generation failed! Try again.${FOOTER}`);

        try {
            await socket.sendMessage(sender, {
                image: { url: imageUrl },
                caption: `🎨 *AI Generated Image*\n\n📝 Prompt: ${prompt}${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Failed to send image: ${e.message}${FOOTER}`);
        }
    }
};
