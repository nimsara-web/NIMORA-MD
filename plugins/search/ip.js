const axios = require('axios');

module.exports = {
    name: 'ip',
    aliases: ['iplookup', 'ipinfo'],
    category: 'search',
    description: 'Lookup IP address info',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const target = args[0];
        if (!target) return reply(`⚠️ Usage: .ip [IP/domain]${FOOTER}`);

        try {
            const res = await axios.get(`http://ip-api.com/json/${encodeURIComponent(target)}`, { timeout: 10000 });
            const d = res.data;

            if (d.status !== 'success') return reply(`❌ Lookup failed!${FOOTER}`);

            await reply(`🌐 *IP INFO*

📍 *Target:* ${target}
🌍 *Country:* ${d.country}
🏙️ *City:* ${d.city}
📍 *Region:* ${d.regionName}
🌐 *ISP:* ${d.isp}
🏢 *Org:* ${d.org}
🕐 *Timezone:* ${d.timezone}
📮 *ZIP:* ${d.zip}
🔢 *IP:* ${d.query}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
