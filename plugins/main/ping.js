module.exports = {
    name: 'ping',
    aliases: ['p'],
    category: 'main',
    description: 'Check bot latency',

    async execute(ctx) {
        const { socket, msg, sender, FOOTER } = ctx;

        const start = Date.now();
        const sent = await socket.sendMessage(sender, { text: '🏓 Pinging...' }, { quoted: msg });
        const latency = Date.now() - start;

        await socket.sendMessage(sender, {
            text: `🏓 *Pong!* ${latency}ms${FOOTER}`,
            edit: sent.key
        }).catch(async () => {
            await socket.sendMessage(sender, {
                text: `🏓 *Pong!* ${latency}ms${FOOTER}`
            }, { quoted: sent });
        });
    }
};
