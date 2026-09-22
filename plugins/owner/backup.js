const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const config = require('../../config');

module.exports = {
    name: 'backup',
    category: 'owner',
    description: 'Backup project files',

    async execute(ctx) {
        const { reply, socket, msg, sender, isMainOwner, channelContext, FOOTER } = ctx;
        if (!isMainOwner) return reply(`⚠️ *Main Owner Only!*${FOOTER}`);

        await reply(`📦 Creating backup... ⏳${FOOTER}`);

        try {
            const zipPath = path.join(__dirname, `../../backup_${Date.now()}.zip`);
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            archive.pipe(output);
            archive.directory(path.join(__dirname, '../../'), false, (entry) => {
                if (entry.name.includes('node_modules') || entry.name.includes('sessions') || entry.name.includes('.env') || entry.name.includes('backup_')) return false;
                return entry;
            });
            await archive.finalize();

            await new Promise(resolve => output.on('close', resolve));

            await socket.sendMessage(sender, {
                document: { url: zipPath },
                mimetype: 'application/zip',
                fileName: `${config.botName}_backup_${Date.now()}.zip`,
                caption: `📦 *Backup Created*\n\n🕐 ${new Date().toLocaleString()}${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

            // Clean up
            setTimeout(() => fs.remove(zipPath).catch(() => {}), 30000);

        } catch (e) {
            await reply(`❌ Backup failed: ${e.message}${FOOTER}`);
        }
    }
};
