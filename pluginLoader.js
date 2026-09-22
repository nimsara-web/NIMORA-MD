/**
 * Project: NIMORA MD - Plugin Loader
 * Creator: Nimsara
 *
 * Automatically loads all command plugins from ./plugins/
 * Each plugin exports: { name, category, execute }
 */

const fs = require('fs-extra');
const path = require('path');

// Store all loaded commands
const commands = new Map();

// Store commands by category
const categories = new Map();

/**
 * Load all plugins from the plugins folder
 */
async function loadPlugins() {
    const pluginBase = path.join(__dirname, 'plugins');

    // Clear previous
    commands.clear();
    categories.clear();

    if (!await fs.pathExists(pluginBase)) {
        console.log('⚠️ [PLUGIN] plugins/ folder not found. Creating...');
        await fs.ensureDir(pluginBase);
        return;
    }

    const categoryFolders = await fs.readdir(pluginBase);

    for (const category of categoryFolders) {
        const categoryPath = path.join(pluginBase, category);
        const stat = await fs.stat(categoryPath).catch(() => null);

        if (!stat || !stat.isDirectory()) continue;

        const files = await fs.readdir(categoryPath);
        const categoryCommands = [];

        for (const file of files) {
            if (!file.endsWith('.js')) continue;

            const filePath = path.join(categoryPath, file);

            try {
                // Clear require cache so reloads work
                delete require.cache[require.resolve(filePath)];

                const plugin = require(filePath);

                // Support single command OR array of commands per file
                const pluginList = Array.isArray(plugin) ? plugin : [plugin];

                for (const p of pluginList) {
                    if (!p || !p.name || typeof p.execute !== 'function') {
                        console.log(`⚠️ [PLUGIN] Invalid plugin: ${category}/${file}`);
                        continue;
                    }

                    const cmdName = p.name.toLowerCase();
                    const cmdCategory = (p.category || category).toLowerCase();

                    commands.set(cmdName, {
                        ...p,
                        name: cmdName,
                        category: cmdCategory,
                        filePath
                    });

                    categoryCommands.push(cmdName);
                }

            } catch (err) {
                console.error(`❌ [PLUGIN] Failed to load ${category}/${file}:`, err.message);
            }
        }

        if (categoryCommands.length > 0) {
            categories.set(category.toLowerCase(), categoryCommands);
            console.log(`✅ [PLUGIN] Loaded ${categoryCommands.length} command(s) from "${category}"`);
        }
    }

    console.log(`\n📦 [PLUGIN] Total commands loaded: ${commands.size}\n`);
}

/**
 * Get a command by name (or alias)
 */
function getCommand(name) {
    if (!name) return null;
    const lower = name.toLowerCase();

    // Direct match
    if (commands.has(lower)) return commands.get(lower);

    // Alias match
    for (const [, cmd] of commands) {
        if (Array.isArray(cmd.aliases) && cmd.aliases.map(a => a.toLowerCase()).includes(lower)) {
            return cmd;
        }
    }

    return null;
}

/**
 * Get all commands
 */
function getAllCommands() {
    return commands;
}

/**
 * Get categories with commands
 */
function getCategories() {
    return categories;
}

/**
 * Reload all plugins (hot reload)
 */
async function reloadPlugins() {
    await loadPlugins();
    return commands.size;
}

module.exports = {
    loadPlugins,
    reloadPlugins,
    getCommand,
    getAllCommands,
    getCategories
};
