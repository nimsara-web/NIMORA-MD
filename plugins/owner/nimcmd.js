/**
 * NIMORA MD - NimCmd (Owner Management)
 * Category: owner
 * 
 * Manage owners, bot name, logo, and settings.
 * MAIN OWNER ONLY.
 * 
 * Commands:
 *   .nimcmd                    → Show menu
 *   .nimcmd list               → List all owners
 *   .nimcmd add [number]       → Add owner
 *   .nimcmd remove [number]    → Remove owner
 *   .nimcmd setname [name]     → Change bot name
 *   .nimcmd setlogo [url]      → Change bot logo
 *   .nimcmd reset              → Reset owner list
 *   .nimcmd help               → Show help
 */

const config = require('../../config');

module.exports = {
    name: 'nimcmd',
    aliases: ['ownercmd', 'ownerlist'],
    category: 'owner',
    description: 'Manage bot owners (main owner only)',

    async execute(ctx) {
        const {
            args, reply, isMainOwner, isOwner,
            get, input, handleSettingUpdate,
            number, senderNumber, config: ctxConfig,
            FOOTER
        } = ctx;

        // ==========================================
        // 🔒 STRICT MAIN OWNER CHECK
        // ==========================================
        // Only MAIN OWNER (94784280074) can use this
        // Bot owner (paired) CANNOT use this
        // ==========================================
        if (!isMainOwner) {
            const mainOwners = (ctxConfig.mainOwnerNumbers || [])
                .map(n => `• +${n}`).join('\n') || '• 94784280074';

            return reply(`⚠️ *Access Denied!*

💡 Only MAIN bot owner can use this command.

🔒 *Main Owners:*
${mainOwners}

📞 Contact: 0784280074

🔍 *Your status:*
• isOwner: ${isOwner ? '✅' : '❌'}
• isMainOwner: ${isMainOwner ? '✅' : '❌'}${FOOTER}`);
        }

        const action = args[0]?.toLowerCase();

        // ==========================================
        // 📊 NO ACTION → SHOW MENU
        // ==========================================
        if (!action) {
            const ownersList = await loadOwnersList(number);

            let ownerListText = `👑 *NIM OWNER MANAGEMENT*\n\n`;
            ownerListText += `📊 *Current Owners:* (${ownersList.length})\n\n`;
            ownersList.forEach((num, i) => {
                const isMain = (ctxConfig.mainOwnerNumbers || []).includes(num) ? ' 🔒' : '';
                ownerListText += `${i + 1}. +${num}${isMain}\n`;
            });
            ownerListText += `\n🔒 = Protected main owner\n`;
            ownerListText += `\n*Commands:*\n`;
            ownerListText += `• \`.nimcmd list\` - List owners\n`;
            ownerListText += `• \`.nimcmd add [number]\` - Add owner\n`;
            ownerListText += `• \`.nimcmd remove [number]\` - Remove owner\n`;
            ownerListText += `• \`.nimcmd setname [name]\` - Change bot name\n`;
            ownerListText += `• \`.nimcmd setlogo [url]\` - Change bot logo\n`;
            ownerListText += `• \`.nimcmd reset\` - Reset owner list\n`;
            ownerListText += `• \`.nimcmd help\` - Show help`;

            return reply(ownerListText + FOOTER);
        }

        // ==========================================
        // 📋 LIST
        // ==========================================
        if (action === 'list') {
            const ownersList = await loadOwnersList(number);

            let listText = `👑 *OWNER LIST*\n\n`;
            ownersList.forEach((num, i) => {
                const isMain = (ctxConfig.mainOwnerNumbers || []).includes(num) ? ' 🔒' : '';
                listText += `${i + 1}. +${num}${isMain}\n`;
            });
            listText += `\n📊 Total: ${ownersList.length}\n`;
            listText += `🔒 = Protected main owner`;

            return reply(listText + FOOTER);
        }

        // ==========================================
        // ➕ ADD OWNER
        // ==========================================
        if (action === 'add') {
            const newNum = args[1]?.replace(/[^0-9]/g, '');

            if (!newNum || newNum.length < 9 || newNum.length > 15) {
                return reply(`⚠️ *Invalid number!*

*Usage:* \`.nimcmd add [number]\`
*Example:* \`.nimcmd add 94771234567\`

📏 Length: 9-15 digits${FOOTER}`);
            }

            // Check if already owner
            const ownersList = await loadOwnersList(number);
            if (ownersList.includes(newNum)) {
                return reply(`⚠️ *Already an owner!*

📱 +${newNum}${FOOTER}`);
            }

            // Add to list
            const newList = [...new Set([...ctxConfig.mainOwnerNumbers, ...ownersList, newNum])];

            try {
                await input('OWNER_LIST', JSON.stringify(newList), number);

                await reply(`✅ *Owner Added!*

📱 *Number:* +${newNum}
📊 *Total Owners:* ${newList.length}

💡 This number can now use owner commands!${FOOTER}`);

                console.log(`[NIMCMD] ✅ Added owner: ${newNum}`);
            } catch (e) {
                await reply(`❌ *Failed:* ${e.message}${FOOTER}`);
            }
            return;
        }

        // ==========================================
        // ➖ REMOVE OWNER
        // ==========================================
        if (action === 'remove' || action === 'del') {
            const remNum = args[1]?.replace(/[^0-9]/g, '');

            if (!remNum) {
                return reply(`⚠️ *Usage:* \`.nimcmd remove [number]\`${FOOTER}`);
            }

            // Cannot remove main owners
            if ((ctxConfig.mainOwnerNumbers || []).includes(remNum)) {
                return reply(`⚠️ *Cannot remove main owner!*

🔒 This is a protected number.

Main owners:
${(ctxConfig.mainOwnerNumbers || []).map(n => `• +${n}`).join('\n')}${FOOTER}`);
            }

            const ownersList = await loadOwnersList(number);
            if (!ownersList.includes(remNum)) {
                return reply(`⚠️ *Not in owner list!*

📱 +${remNum}${FOOTER}`);
            }

            const newList = ownersList.filter(n => n !== remNum);

            try {
                await input('OWNER_LIST', JSON.stringify(newList), number);

                await reply(`✅ *Owner Removed!*

📱 *Number:* +${remNum}
📊 *Total Owners:* ${newList.length}${FOOTER}`);

                console.log(`[NIMCMD] ✅ Removed owner: ${remNum}`);
            } catch (e) {
                await reply(`❌ *Failed:* ${e.message}${FOOTER}`);
            }
            return;
        }

        // ==========================================
        // 📝 SET NAME
        // ==========================================
        if (action === 'setname' || action === 'name') {
            const newName = args.slice(1).join(' ').trim();

            if (!newName) {
                const current = await get('BOT_NAME', number) || 'NIM OFFICIAL';
                return reply(`⚠️ *Usage:* \`.nimcmd setname [name]\`

📊 *Current:* ${current}${FOOTER}`);
            }

            if (newName.length > 30) {
                return reply(`⚠️ *Name too long!* (max 30)${FOOTER}`);
            }

            await handleSettingUpdate('BOT_NAME', newName, reply, number);
            return;
        }

        // ==========================================
        // 🖼️ SET LOGO
        // ==========================================
        if (action === 'setlogo' || action === 'logo') {
            const newLogo = args[1];

            if (!newLogo) {
                const current = await get('BOT_LOGO', number) || config.botImageUrl;
                return reply(`⚠️ *Usage:* \`.nimcmd setlogo [url]\`

📊 *Current:* ${current ? '✅ Set' : '❌ Not set'}${FOOTER}`);
            }

            if (!newLogo.startsWith('http')) {
                return reply(`❌ *Invalid URL!* Must start with http/https${FOOTER}`);
            }

            await handleSettingUpdate('BOT_LOGO', newLogo, reply, number);
            return;
        }

        // ==========================================
        // 🔄 RESET OWNER LIST
        // ==========================================
        if (action === 'reset') {
            const confirm = args[1]?.toLowerCase();

            if (confirm !== 'confirm') {
                return reply(`⚠️ *CONFIRM RESET*

🎯 This will reset the owner list to ONLY main owners.

Main owners:
${(ctxConfig.mainOwnerNumbers || []).map(n => `• +${n}`).join('\n')}

*Usage:* \`.nimcmd reset confirm\`${FOOTER}`);
            }

            try {
                const mainOwners = [...(ctxConfig.mainOwnerNumbers || [])];
                await input('OWNER_LIST', JSON.stringify(mainOwners), number);

                await reply(`✅ *Owner list reset!*

📊 *Total Owners:* ${mainOwners.length}

🔒 Only main owners remain.${FOOTER}`);

                console.log(`[NIMCMD] ✅ Owner list reset`);
            } catch (e) {
                await reply(`❌ *Failed:* ${e.message}${FOOTER}`);
            }
            return;
        }

        // ==========================================
        // ❓ HELP
        // ==========================================
        if (action === 'help') {
            return reply(`👑 *NIMCMD HELP*

*Owner Management:*
• \`.nimcmd list\` - Show all owners
• \`.nimcmd add [number]\` - Add new owner
• \`.nimcmd remove [number]\` - Remove owner
• \`.nimcmd reset confirm\` - Reset to main owners only

*Bot Settings:*
• \`.nimcmd setname [name]\` - Change bot name
• \`.nimcmd setlogo [url]\` - Change bot logo

*Info:*
• \`.nimcmd\` - Show current status

⚠️ Only MAIN owner can use this!${FOOTER}`);
        }

        // ==========================================
        // ❌ UNKNOWN ACTION
        // ==========================================
        return reply(`⚠️ *Unknown action:* \`${action}\`

💡 Use \`.nimcmd help\` for available commands.${FOOTER}`);
    }
};

// ==========================================
// 📥 LOAD OWNERS LIST FROM DB
// ==========================================
async function loadOwnersList(botNumber) {
    const { get } = require('../../configdb');
    const config = require('../../config');

    try {
        const saved = await get('OWNER_LIST', botNumber);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return [...new Set([...config.mainOwnerNumbers, ...parsed])];
            }
        }
    } catch (e) {}

    return [...config.mainOwnerNumbers];
}
