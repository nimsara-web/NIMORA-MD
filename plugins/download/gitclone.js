const axios = require('axios');

module.exports = {
    name: 'gitclone',
    aliases: ['gitdl'],
    category: 'download',
    description: 'Download GitHub repo as ZIP',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || !url.includes('github.com')) {
            return reply(`⚠️ Usage: .gitclone [github repo URL]${FOOTER}`);
        }

        const match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
        if (!match) return reply(`❌ Invalid GitHub URL!${FOOTER}`);

        const [, user, repo] = match;
        const cleanRepo = repo.replace(/\.git$/, '');
        const zipUrl = `https://github.com/${user}/${cleanRepo}/archive/refs/heads/main.zip`;

        await reply(`📥 Downloading repo... ⏳${FOOTER}`);

        try {
            await socket.sendMessage(sender, {
                document: { url: zipUrl },
                mimetype: 'application/zip',
                fileName: `${cleanRepo}.zip`,
                caption: `📦 *${user}/${cleanRepo}*\n\n🔗 ${url}${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            // Try master branch
            const masterUrl = `https://github.com/${user}/${cleanRepo}/archive/refs/heads/master.zip`;
            try {
                await socket.sendMessage(sender, {
                    document: { url: masterUrl },
                    mimetype: 'application/zip',
                    fileName: `${cleanRepo}.zip`,
                    caption: `📦 *${user}/${cleanRepo}*${FOOTER}`,
                    contextInfo: channelContext
                }, { quoted: msg });
            } catch (e2) {
                await reply(`❌ Download failed!${FOOTER}`);
            }
        }
    }
};
