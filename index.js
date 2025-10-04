import { Telegraf } from "telegraf";
import fetch from "node-fetch";

const bot = new Telegraf(process.env.BOT_TOKEN); // set in Railway
 const userId = ctx.from.id; // 👈 user ID

  console.log("User ID:", userId);

// Simple command /start
bot.start((ctx) => ctx.reply("Send me a game name and I'll fetch info from SteamDB + HowLongToBeat!"));

// Listen for any text message
bot.on("text", async (ctx) => {
  const query = ctx.message.text.trim();
  const userId = ctx.from.id; // 👈 user ID

  console.log("User ID:", userId);

  if (!query) {
    return ctx.reply(`Your ID: ${userId}\nPlease type a game name!`);
  }

  ctx.reply(`Your ID: ${userId}\n🔎 Searching for *${query}*...`, { parse_mode: "Markdown" });

  try {
    const res = await fetch(
      `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${process.env.RAWG_API_KEY}`
    );
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return ctx.reply(`Your ID: ${userId}\n❌ No results found.`);
    }

    const game = data.results[0];
    const msg = `
🎮 *${game.name}*
📅 Released: ${game.released || "N/A"}
⭐ Rating: ${game.rating || "N/A"}
`;

    if (game.background_image) {
      await ctx.replyWithPhoto(game.background_image, {
        caption: `Your ID: ${userId}\n${msg}`,
        parse_mode: "Markdown",
      });
    } else {
      await ctx.reply(`Your ID: ${userId}\n${msg}`, { parse_mode: "Markdown" });
    }
  } catch (err) {
    console.error(err);
    ctx.reply(`Your ID: ${userId}\n⚠️ Error fetching game info, please try again later.`);
  }
});

bot.launch();
