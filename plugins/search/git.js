const axios = require('axios');

module.exports = {
    name: 'git',
    aliases: ['github', 'gh'],
    category: 'search',
    description: 'Search GitHub users/repos',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .git [username/repo]${FOOTER}`);

        try {
            // Try user first
            const userRes = await axios.get(`https://api.github.com/users/${encodeURIComponent(query)}`, {
                timeout: 10000,
                headers: { 'User-Agent': 'NIMORA-MD' }
            });

            const u = userRes.data;

            let text = `🐙 *GITHUB USER*\n\n`;
            text += `👤 *Name:* ${u.name || u.login}\n`;
            text += `🔗 *Username:* @${u.login}\n`;
            text += `📝 *Bio:* ${u.bio || 'N/A'}\n`;
            text += `📦 *Public Repos:* ${u.public_repos}\n`;
            text += `👥 *Followers:* ${u.followers}\n`;
            text += `👣 *Following:* ${u.following}\n`;
            text += `📍 *Location:* ${u.location || 'N/A'}\n`;
            text += `🔗 *URL:* ${u.html_url}\n`;

            await socket.sendMessage(ctx.sender, {
                image: { url: u.avatar_url },
                caption: text + FOOTER,
                contextInfo: ctx.channelContext
            }, { quoted: ctx.msg });

        } catch (e) {
            // Try repo search
            try {
                const res = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, {
                    timeout: 10000,
                    headers: { 'User-Agent': 'NIMORA-MD' }
                });

                const repos = res.data?.items || [];
                if (repos.length === 0) return reply(`❌ Not found!${FOOTER}`);

                let list = `🐙 *GITHUB REPOS*\n\n`;
                repos.forEach((r, i) => {
                    list += `${i + 1}. *${r.full_name}*\n`;
                    list += `   ⭐ ${r.stargazers_count} | 🍴 ${r.forks_count}\n`;
                    list += `   📝 ${r.description || 'No description'}\n`;
                    list += `   🔗 ${r.html_url}\n\n`;
                });

                await reply(list + FOOTER);
            } catch (e2) {
                await reply(`❌ GitHub failed!${FOOTER}`);
            }
        }
    }
};
