import { Telegraf, Markup } from 'telegraf';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('❌ BOT_TOKEN не заданий!');
  process.exit(1);
}

const bot = new Telegraf(token);

// "База даних" у пам'яті
const players = {}; 

function startGame(userId) {
  players[userId] = {
    health: 100,
    monsterHealth: 80,
    rating: players[userId]?.rating ?? 0
  };
}

function getGameState(userId) {
  const p = players[userId];
  return `🧑‍💻 Ваше здоров'я: ${p.health}\n👹 Здоров'я монстра: ${p.monsterHealth}\n🏆 Рейтинг: ${p.rating}`;
}

bot.start((ctx) => {
  startGame(ctx.from.id);
  ctx.reply(
    'Здарова Артем, Вдад написав бота з допомогою часа жпт, і хвастається тобі',
    Markup.inlineKeyboard([
      [Markup.button.callback('⚔️ Удар', 'hit')],
      [Markup.button.callback('💥 Сильний удар', 'strong_hit')],
      [Markup.button.callback('🛡 Блок', 'block')],
    ])
  );
  ctx.reply(getGameState(ctx.from.id));
});

function attackMonster(ctx, damage) {
  const player = players[ctx.from.id];
  player.monsterHealth -= damage;

  if (player.monsterHealth > 0) {
    const monsterDamage = Math.floor(Math.random() * 15);
    player.health -= monsterDamage;
  }

  if (player.monsterHealth <= 0) {
    player.rating++;
    ctx.reply(`🎉 Ви перемогли монстра!\n🏆 Рейтинг +1 = ${player.rating}`);
    startGame(ctx.from.id);
  } else if (player.health <= 0) {
    player.rating--;
    ctx.reply(`💀 Ви програли монстру!\n🏆 Рейтинг -1 = ${player.rating}`);
    startGame(ctx.from.id);
  }

  ctx.reply(getGameState(ctx.from.id));
}

bot.action('hit', (ctx) => {
  attackMonster(ctx, Math.floor(Math.random() * 15) + 5);
});

bot.action('strong_hit', (ctx) => {
  if (Math.random() < 0.3) {
    ctx.reply('❌ Ви промахнулись!');
  } else {
    attackMonster(ctx, Math.floor(Math.random() * 30) + 10);
  }
});

bot.action('block', (ctx) => {
  const player = players[ctx.from.id];
  const blockedDamage = Math.floor(Math.random() * 10);
  player.health += blockedDamage;
  ctx.reply(`🛡 Ви заблокували атаку й відновили ${blockedDamage} HP!`);
  ctx.reply(getGameState(ctx.from.id));
});

bot.launch();
console.log('✅ Бот запущений');