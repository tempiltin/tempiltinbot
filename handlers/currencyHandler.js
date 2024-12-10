const { validCurrencies } = require('../config/constants');
const { getCurrencyKeyboard } = require('../utils/keyboards');

async function handleCurrencyQuery(bot, query) {
  const chatId = query.message.chat.id;

  try {
    if (query.data === 'currency_rates') {
      await bot.sendMessage(
        chatId, 
        "Iltimos, kerakli valyutani tanlang:", 
        getCurrencyKeyboard()
      );
      return;
    }

    if (!validCurrencies.includes(query.data)) {
      return;
    }

    const response = await fetch('https://www.nbu.uz/uz/exchange-rates/json/');
    const data = await response.json();

    const selectedCurrency = data.find(currency => currency.code === query.data);
    if (!selectedCurrency) {
      await bot.sendMessage(chatId, "Tanlangan valyuta haqida ma'lumot topilmadi.");
      return;
    }

    let message = `💱 *${selectedCurrency.title} (${selectedCurrency.code}) kursi:*\n\n`;
    message += `- Markaziy bank kursi: ${selectedCurrency.cb_price} so'm\n`;
    if (selectedCurrency.nbu_buy_price) {
      message += `- NBU sotib olish: ${selectedCurrency.nbu_buy_price} so'm\n`;
    }
    if (selectedCurrency.nbu_cell_price) {
      message += `- NBU sotish: ${selectedCurrency.nbu_cell_price} so'm\n`;
    }

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Currency handler error:", error);
    await bot.sendMessage(
      chatId, 
      "Valyuta kurslarini olishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring."
    );
  }
}

module.exports = handleCurrencyQuery;