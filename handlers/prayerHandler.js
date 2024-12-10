const constants = require('../config/constants');
const { getPrayerTimesKeyboard } = require('../utils/keyboards');

async function handlePrayerQuery(bot, query) {
  const chatId = query.message.chat.id;

  if (query.data === 'prayer_times') {
    bot.sendMessage(chatId, "Iltimos, viloyatni tanlang:", getPrayerTimesKeyboard());
  } else if (query.data.startsWith('region_')) {
    const regionId = query.data.split('_')[1];
    const selectedRegion = constants.regions.find(r => r.id === regionId);

    if (selectedRegion) {
      try {
        const response = await fetch(`https://islomapi.uz/api/present/week?region=${regionId}`);
        const data = await response.json();

        const today = new Date().getDay();
        const todayTimes = data[today];

        let message = `📍 *${selectedRegion.name} viloyati nomoz vaqtlari:*\n\n`;
        message += `📅 *${constants.dayNames[today]}*\n`;
        message += `- Bomdod (Saharlik): ${todayTimes.times.tong_saharlik}\n`;
        message += `- Quyosh: ${todayTimes.times.quyosh}\n`;
        message += `- Peshin: ${todayTimes.times.peshin}\n`;
        message += `- Asr: ${todayTimes.times.asr}\n`;
        message += `- Shom (Iftorlik): ${todayTimes.times.shom_iftor}\n`;
        message += `- Xufton: ${todayTimes.times.hufton}\n`;

        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      } catch (error) {
        console.error("Error fetching prayer times:", error);
        bot.sendMessage(chatId, "Nomoz vaqtlarini olishda xatolik yuz berdi. Keyinroq qayta urinib ko'ring.");
      }
    }
  }
}

module.exports = handlePrayerQuery;