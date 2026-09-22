/**
 * Generic owner command template
 * Copy this file, change name/category/execute
 */
const { readJson, writeJson } = require('./_helper');

module.exports = {
    name: 'commandname',
    aliases: [],
    category: 'owner',
    description: 'Description',

    async execute(ctx) {
        const { args, reply, isOwner, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        // Your logic here

        await reply(`✅ Done!${FOOTER}`);
    }
};
