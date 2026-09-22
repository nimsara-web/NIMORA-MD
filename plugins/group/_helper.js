async function isGroupAdmin(socket, groupJid, participantJid) {
    try {
        const meta = await socket.groupMetadata(groupJid);
        const p = meta.participants.find(x => x.id === participantJid);
        return p?.admin === 'admin' || p?.admin === 'superadmin';
    } catch (e) {
        return false;
    }
}

async function isBotAdmin(socket, groupJid) {
    try {
        const meta = await socket.groupMetadata(groupJid);
        const botJid = socket.user.id.split(':')[0] + '@s.whatsapp.net';
        const p = meta.participants.find(x => x.id === botJid);
        return p?.admin === 'admin' || p?.admin === 'superadmin';
    } catch (e) {
        return false;
    }
}

module.exports = { isGroupAdmin, isBotAdmin };
