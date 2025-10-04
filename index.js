import { Telegraf } from "telegraf";
import fetch from "node-fetch";

const bot = new Telegraf(process.env.BOT_TOKEN); // set in Railway

// Simple command /start
bot.start((ctx) => ctx.reply("Send me a game name and I'll fetch info from SteamDB + HowLongToBeat!"));

// Listen for any text message
bot.on("text", async (ctx) => {
  const query = ctx.message.text.trim();
  if (!query) {
    return ctx.reply("Please send a game name!");
  }

  ctx.reply(`🔎 Searching for "${query}" ...`);

  try {
    // Example: Search Steam Store API
    const steamRes = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=us`
    );
    const steamData = await steamRes.json();

    let replyMessage = `🎮 Results for "${query}":\n`;

    if (steamData.items && steamData.items.length > 0) {
      const firstGame = steamData.items[0];
      replyMessage += `\n🕹️ Steam: ${firstGame.name}\n`;
      replyMessage += `💲 Price: ${firstGame.price ? firstGame.price.final / 100 : "Free"} USD\n`;
      replyMessage += `🔗 Link: https://store.steampowered.com/app/${firstGame.id}\n`;

      if (firstGame.tiny_image) {
        await ctx.replyWithPhoto(firstGame.tiny_image);
      }
    } else {
      replyMessage += "\n⚠️ No results on Steam.";
    }

    // Example: HowLongToBeat (unofficial API wrapper)
    const hltbRes = await fetch(
      `https://howlongtobeat.com/api/search` // ⚠️ requires wrapper / proxy, not public API
    );

    // For now, just placeholder (since HLTB API needs scraping or a wrapper)
    replyMessage += `\n⏱️ HowLongToBeat: (integration required with unofficial API)`;

    ctx.reply(replyMessage);
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Error while fetching game info.");
  }
});

bot.launch();
