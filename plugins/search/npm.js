const axios = require('axios');

module.exports = {
    name: 'npm',
    aliases: ['npmpkg'],
    category: 'search',
    description: 'Search npm packages',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .npm [package name]${FOOTER}`);

        try {
            const res = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(query)}`, { timeout: 10000 });
            const d = res.data;
            const latest = d['dist-tags']?.latest;
            const version = d.versions?.[latest];

            let text = `📦 *NPM PACKAGE*\n\n`;
            text += `📛 *Name:* ${d.name}\n`;
            text += `📌 *Latest:* ${latest}\n`;
            text += `📝 *Description:* ${d.description || 'N/A'}\n`;
            text += `👤 *Author:* ${d.author?.name || 'N/A'}\n`;
            text += `📜 *License:* ${d.license || 'N/A'}\n`;
            text += `🔗 *Homepage:* ${d.homepage || 'N/A'}\n`;
            text += `📦 *Repo:* ${d.repository?.url || 'N/A'}\n`;
            if (version) {
                text += `\n📊 *Version Info:*\n`;
                text += `• Dependencies: ${Object.keys(version.dependencies || {}).length}\n`;
                text += `• Files: ${version.dist?.fileCount || 'N/A'}\n`;
                text += `• Size: ${version.dist?.unpackedSize ? (version.dist.unpackedSize / 1024).toFixed(1) + ' KB' : 'N/A'}\n`;
            }
            text += `\n🔗 https://www.npmjs.com/package/${d.name}`;

            await reply(text + FOOTER);
        } catch (e) {
            if (e.response?.status === 404) {
                return reply(`❌ Package not found!${FOOTER}`);
            }
            await reply(`❌ NPM failed!${FOOTER}`);
        }
    }
};
