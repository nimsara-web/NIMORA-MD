module.exports = {
    name: 'seedr',
    category: 'download',
    description: 'Seedr.cc cloud download',

    async execute(ctx) {
        const { args, reply, FOOTER } = ctx;

        const url = args[0];
        if (!url) return reply(`⚠️ Usage: .seedr [torrent/magnet link]${FOOTER}`);

        await reply(`⚠️ *Seedr Feature*

To use seedr, please visit:
🔗 https://www.seedr.cc/

📝 Steps:
1. Create free account
2. Add magnet/torrent link
3. Download files

💡 _Full seedr integration coming soon!_${FOOTER}`);
    }
};
