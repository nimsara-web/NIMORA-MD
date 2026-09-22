const axios = require('axios');
const config = require('../../config');

async function askAI(query) {
    // Try NIM API first
    try {
        const res = await axios.get(`${config.nimApiBase}/api/ai/gpt?apiKey=${config.nimApiKey}&q=${encodeURIComponent(query)}`, { timeout: 30000 });
        const answer = res.data?.result || res.data?.data || res.data?.response || res.data?.answer;
        if (answer) return answer;
    } catch (e) {}

    // Fallback APIs
    const apis = [
        { url: `https://bk9.fun/ai/gemini?q=${encodeURIComponent(query)}`, extract: d => d?.result || d?.gpt || d?.answer },
        { url: `https://api.siputzx.my.id/api/ai/chatgpt?q=${encodeURIComponent(query)}`, extract: d => d?.data || d?.response },
        { url: `https://delirius-apiofc.vercel.app/ai/gpt4?q=${encodeURIComponent(query)}`, extract: d => d?.data || d?.response }
    ];

    for (const api of apis) {
        try {
            const res = await axios.get(api.url, { timeout: 20000 });
            const answer = api.extract(res.data);
            if (answer) return answer;
        } catch (e) {}
    }
    return null;
}

module.exports = {
    name: 'ai',
    aliases: ['gpt', 'chatgpt', 'gemini'],
    category: 'ai',
    description: 'Ask AI anything',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .ai [question]${FOOTER}`);

        await reply(`🤖 Thinking... 🤔${FOOTER}`);

        const answer = await askAI(query);
        if (!answer) return reply(`❌ AI failed. Try again later.${FOOTER}`);

        const trimmed = answer.length > 3500 ? answer.substring(0, 3500) + '...' : answer;

        await reply(`🤖 *AI ASSISTANT*

${trimmed}${FOOTER}`);
    }
};
