const constants = require('../config/constants');

function getMainMenu(removeKeyboard = false) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Tempiltinga habar yuborish 👨🏻‍💻", url: "https://t.me/tempiltin" }],
        [{ text: "Tempiltin websaytini ochish🌐 ", url: "https://tempiltin.uz" }],
        [{ text: "Portfolio 💼", url: "https://telegra.ph/Portfolio-Tempiltin-12-07" }],
        [{ text: "Valuta kurslari 🏦", callback_data: 'currency_rates' }],
        [{ text: "Nomoz vaqtlari 🕒", callback_data: 'prayer_times' }]
      ]
    }
  };

  if (removeKeyboard) {
    options.reply_markup.remove_keyboard = true;
  }

  return options;
}

function getSubscriptionKeyboard(channelId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Obuna bo'lish", url: `https://t.me/${channelId}` }],
        [{ text: "Obunani tekshirish", callback_data: 'check_subscription' }]
      ]
    }
  };
}

function getPhoneKeyboard() {
  return {
    reply_markup: {
      keyboard: [[{ text: "Raqamni yuborish", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
}

function getCurrencyKeyboard() {
  const { validCurrencies } = constants;
  const keyboard = [];
  
  for (let i = 0; i < validCurrencies.length; i += 2) {
    const row = [];
    row.push({
      text: getCurrencyText(validCurrencies[i]),
      callback_data: validCurrencies[i]
    });
    
    if (i + 1 < validCurrencies.length) {
      row.push({
        text: getCurrencyText(validCurrencies[i + 1]),
        callback_data: validCurrencies[i + 1]
      });
    }
    
    keyboard.push(row);
  }

  return {
    reply_markup: {
      inline_keyboard: keyboard
    }
  };
}

function getCurrencyText(code) {
  const currencyNames = {
    UAH: "Ukraina grivnasi",
    USD: "AQSh dollari",
    AED: "BAA dirhami",
    AUD: "Avstraliya dollari",
    CAD: "Kanada dollari",
    CHF: "Shveytsariya franki",
    CNY: "Xitoy yuani",
    DKK: "Daniya kronasi",
    EGP: "Misr funti",
    EUR: "Yevro",
    GBP: "Angliya funt sterlingi",
    ISK: "Islandiya kronasi",
    JPY: "Yaponiya iyenasi",
    KRW: "Koreya respublikasi voni",
    KWD: "Quvayt dinori",
    KZT: "Qozog'iston tengesi",
    LBP: "Livan funti",
    MYR: "Malayziya ringgiti",
    NOK: "Norvegiya kronasi",
    PLN: "Polsha zlotiysi",
    RUB: "Rossiya rubli",
    SEK: "Shvetsiya kronasi",
    SGD: "Singapur dollari",
    TRY: "Turkiya lirasi"
  };
  
  return `${currencyNames[code] || code} (${code})`;
}

function getPrayerTimesKeyboard() {
  const regionButtons = constants.regions.map(region => [{
    text: region.name,
    callback_data: `region_${region.id}`
  }]);

  return {
    reply_markup: {
      inline_keyboard: regionButtons
    }
  };
}

module.exports = {
  getMainMenu,
  getSubscriptionKeyboard,
  getPhoneKeyboard,
  getCurrencyKeyboard,
  getPrayerTimesKeyboard
};