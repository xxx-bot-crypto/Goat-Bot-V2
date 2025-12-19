// utils.js (helper functions)
global.utils = {
  getPrefix: (threadID) => "!", // Example prefix
  getStreamFromURL: async (url) => {
    const axios = require("axios");
    return (await axios.get(url, { responseType: "arraybuffer" })).data;
  },
};

// Sample commands map
global.GoatBot = {
  commands: new Map(),
  aliases: new Map(),
};

// Example command for testing
const testCommand = {
  config: {
    name: "ping",
    aliases: ["p"],
    category: "general",
    role: 0,
    version: "1.0",
    guide: { en: "{he}ping" },
    shortDescription: { en: "Check bot response" },
    longDescription: { en: "Sends a pong message to check bot response." },
  },
  onStart: async function ({ message }) {
    await message.reply("Pong!");
  },
};

// Add test command to global commands
global.GoatBot.commands.set("ping", testCommand);
global.GoatBot.aliases.set("p", "ping");

// Help command
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.18",
    author: "Ktkhang | modified Sanjida Snigdha",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View command usage and list all commands directly" },
    longDescription: { en: "View command usage and list all commands directly" },
    category: "info",
    guide: { en: "help <command>" },
    priority: 1,
  },

  onStart: async function ({ message, args, event, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    const helpImage = "https://i.imgur.com/8XIHCo9.jpeg";

    if (!args[0]) {
      const categories = {};
      let msg = "";

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).sort().forEach((category) => {
        if (category !== "info") {
          msg += `\n╭─────⭓ ${category.toUpperCase()}`;
          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 2) {
            const cmds = names.slice(i, i + 2).map((item) => `✧${item}`);
            msg += `\n│ ${cmds.join("   ")}`;
          }
          msg += `\n╰────────────⭓\n`;
        }
      });

      msg += `\n⭔ Bot has ${commands.size} commands`;
      msg += `\n⭔ Type ${prefix}help <command name> to see usage`;
      msg += `\n╭─✦ ADMIN: Sanjida Snigdha\n├‣ FACEBOOK\n╰‣ m.me/sanjidasnigdha`;

      const sent = await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpImage),
      });

      setTimeout(() => message.unsend(sent.messageID), 80000);
    } else {
      const commandName = args[0].toLowerCase();
      const command =
        commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) return message.reply(`Command "${commandName}" not found.`);

      const c = command.config;
      const roleText = roleTextToString(c.role);
      const usage = (c.guide?.en || "No guide").replace(/{he}/g, prefix).replace(/{lp}/g, c.name);

      const res = `╭─────────⭓
│ 🎀 NAME: ${c.name}
│ 📃 Aliases: ${c.aliases ? c.aliases.join(", ") : "None"}
├──‣ INFO
│ 📝 Description: ${c.longDescription?.en || "No description"}
│ 👑 Admin: Sanjida Snigdha
│ 📚 Guide: ${usage}
├──‣ Usage
│ ⭐ Version: ${c.version || "1.0"}
│ ♻️ Role: ${roleText}
╰────────────⭓`;

      const sent = await message.reply({
        body: res,
        attachment: await global.utils.getStreamFromURL(helpImage),
      });

      setTimeout(() => message.unsend(sent.messageID), 80000);
    }
  },
};

function roleTextToString(role) {
  if (role === 0) return "0 (All users)";
  if (role === 1) return "1 (Group admins)";
  if (role === 2) return "2 (Bot admin)";
  return "Unknown";
}
