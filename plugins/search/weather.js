const axios = require('axios');

module.exports = {
    name: 'weather',
    aliases: ['wthr'],
    category: 'search',
    description: 'Get weather for a city',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const city = args.join(' ');
        if (!city) return reply(`⚠️ Usage: .weather [city]${FOOTER}`);

        try {
            const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { timeout: 15000 });
            const d = res.data;
            const current = d.current_condition[0];
            const area = d.nearest_area[0];

            await reply(`🌍 *WEATHER REPORT*

📍 *City:* ${area.areaName[0].value}
🌍 *Country:* ${area.country[0].value}
🌡️ *Temp:* ${current.temp_C}°C (feels ${current.FeelsLikeC}°C)
☁️ *Condition:* ${current.weatherDesc[0].value}
💧 *Humidity:* ${current.humidity}%
💨 *Wind:* ${current.windspeedKmph} km/h
👁️ *Visibility:* ${current.visibility} km
🌅 *Sunrise:* ${d.weather[0].astronomy[0].sunrise}
🌇 *Sunset:* ${d.weather[0].astronomy[0].sunset}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Weather failed!${FOOTER}`);
        }
    }
};
