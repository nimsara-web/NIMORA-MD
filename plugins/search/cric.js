const axios = require('axios');

module.exports = {
    name: 'cric',
    aliases: ['cricket', 'cricscore'],
    category: 'search',
    description: 'Live cricket scores',

    async execute(ctx) {
        const { reply, FOOTER } = ctx;

        await reply(`🏏 Fetching cricket scores... ⏳${FOOTER}`);

        try {
            const res = await axios.get('https://api.cricapi.com/v1/currentMatches?apikey=demo&offset=0', { timeout: 15000 });
            const matches = res.data?.data || [];

            if (matches.length === 0) return reply(`❌ No matches found!${FOOTER}`);

            let text = `🏏 *LIVE CRICKET SCORES*\n\n`;
            matches.slice(0, 5).forEach((m, i) => {
                text += `${i + 1}. *${m.name}*\n`;
                text += `   📊 ${m.status || 'In Progress'}\n`;
                text += `   🏟️ ${m.venue || 'N/A'}\n`;
                text += `   📅 ${m.date || 'N/A'}\n\n`;
            });

            await reply(text + FOOTER);
        } catch (e) {
            await reply(`❌ Cricket API failed! Try again later.${FOOTER}`);
        }
    }
};
