import { Telegraf } from "telegraf";
import fetch from "node-fetch";

const bot = new Telegraf("YOUR_BOT_TOKEN");

// команда /start
bot.start((ctx) => {
  ctx.reply("Привіт 👋 Введи назву гри, і я знайду її у Steam.");
});

// будь-яке повідомлення юзера — трактуємо як назву гри
bot.on("text", async (ctx) => {
  const name = ctx.message.text.trim();
  console.log("Отримав запит:", name);

  if (!name) {
    ctx.reply("⚠️ Введи назву гри!");
    return;
  }

  try {
    // 1) Пошук у Steam Store
    const searchResp = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
        name
      )}&cc=us&l=en`
    );
    const searchData = await searchResp.json();
    console.log("Результат пошуку:", searchData);

    if (!searchData.items || searchData.items.length === 0) {
      ctx.reply("❌ Гру не знайдено.");
      return;
    }

    const match = searchData.items[0];
    console.log("Збіг:", match);

    // 2) Деталі гри
    const detailsResp = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${match.id}&l=uk`
    );
    const detailsData = await detailsResp.json();
    const gameInfo = detailsData[match.id].data;
    console.log("Дані гри:", gameInfo);

    // 3) Формуємо відповідь
    let text = `🎮 *${gameInfo.name}*\n\n`;
    text += `*Жанри:* ${gameInfo.genres
      ?.map((g) => g.description)
      .join(", ")}\n\n`;
    text += `*Опис:* ${gameInfo.short_description}`;

    // надсилаємо картинку + текст
    await ctx.replyWithPhoto(
      { url: gameInfo.header_image },
      { caption: text, parse_mode: "Markdown" }
    );

  } catch (err) {
    console.error("Помилка:", err);
    ctx.reply("⚠️ Сталася помилка при пошуку.");
  }
});

bot.launch();
