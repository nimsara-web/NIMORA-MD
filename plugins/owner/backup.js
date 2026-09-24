/**
 * NIMORA MD - Backup Command
 * Category: owner
 * 
 * Backup bot data (sessions + configs) as JSON.
 * MAIN OWNER ONLY.
 * 
 * ⚠️ Note: Uses JSON instead of ZIP (no archiver needed).
 */

const fs = require('fs-extra');
const path = require('path');
const config = require('../../config');
const Session = require('../../Id');

module.exports = {
    name: 'backup',
    aliases: ['bkup', 'savebackup'],
    category: 'owner',
    description: 'Backup bot sessions + configs (main owner only)',

    async execute(ctx) {
        const {
            reply, socket, msg, sender, isMainOwner, isOwner,
            number, channelContext, FOOTER
        } = ctx;

        // ==========================================
        // 🔒 MAIN OWNER ONLY
        // ==========================================
        if (!isMainOwner) {
            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can create backups.

📞 Contact: 0784280074${FOOTER}`);
        }

        await reply(`📦 *Creating backup...* ⏳${FOOTER}`);

        try {
            // ==========================================
            // 1️⃣ LOAD SESSIONS FROM DB
            // ==========================================
            const sessions = await Session.find({});

            // ==========================================
            // 2️⃣ LOAD CONFIGS FROM DB
            // ==========================================
            const { Config } = require('../../configdb');
            const configs = await Config.find({});

            // ==========================================
            // 3️⃣ BUILD BACKUP OBJECT
            // ==========================================
            const backupData = {
                metadata: {
                    botName: config.botName,
                    creator: config.ownerName,
                    createdAt: new Date().toISOString(),
                    version: '2.0'
                },
                stats: {
                    totalSessions: sessions.length,
                    totalConfigs: configs.length
                },
                sessions: sessions.map(s => ({
                    number: s.number,
                    hasCreds: !!(s.creds && Object.keys(s.creds).length > 0),
                    createdAt: s.createdAt,
                    lastSeen: s.lastSeen,
                    isActive: s.isActive,
                    // ⚠️ Include creds but sanitized
                    creds: s.creds || {}
                })),
                configs: configs.map(c => ({
                    number: c.number,
                    settings: c.settings ? Object.fromEntries(c.settings) : {},
                    updatedAt: c.updatedAt
                }))
            };

            // ==========================================
            // 4️⃣ CONVERT TO JSON
            // ==========================================
            const jsonStr = JSON.stringify(backupData, null, 2);
            const buffer = Buffer.from(jsonStr, 'utf8');

            const fileName = `${config.botName.replace(/\s+/g, '_')}_backup_${Date.now()}.json`;

            // ==========================================
            // 5️⃣ SEND AS DOCUMENT
            // ==========================================
            await socket.sendMessage(sender, {
                document: buffer,
                mimetype: 'application/json',
                fileName: fileName,
                caption: `📦 *BACKUP CREATED*

📊 *Sessions:* ${sessions.length}
⚙️ *Configs:* ${configs.length}
🕐 *Time:* ${new Date().toLocaleString()}

💡 *Note:* JSON format (no ZIP)
🔒 Contains session credentials — keep safe!${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

            console.log(`[BACKUP] ✅ Created: ${fileName} (${buffer.length} bytes)`);

        } catch (e) {
            console.error(`[BACKUP] ❌ Error:`, e.message);
            await reply(`❌ *Backup failed!*

📝 Error: ${e.message}

💡 Try again or contact support.${FOOTER}`);
        }
    }
};
