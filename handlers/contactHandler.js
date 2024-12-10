const User = require('../models/User');
const { getMainMenu } = require('../utils/keyboards');
const { checkMembership } = require('../utils/channelUtils');

async function handleContact(bot, msg, channelNumericId) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const phoneNumber = msg.contact.phone_number;

  try {
    let user = await User.findOne({ userId: userId.toString() });
    
    if (user) {
      user.phone = phoneNumber;
      await user.save();
    } else {
      user = new User({
        userId: userId.toString(),
        username: msg.from.username || "No username",
        phone: phoneNumber
      });
      await user.save();
    }

    const isMember = await checkMembership(bot, channelNumericId, userId);
    if (isMember) {
      bot.sendMessage(
        chatId, 
        "Telefon raqamingiz muvaffaqiyatli saqlandi! Siz botdan foydalanishingiz mumkin!", 
        getMainMenu(true)
      );
    } else {
      bot.sendMessage(
        chatId,
        "Telefon raqamingiz saqlandi, lekin botdan foydalanish uchun kanalga a'zo bo'lishingiz kerak.",
        getSubscriptionKeyboard(channelId)
      );
    }
  } catch (error) {
    console.error("User saqlashda xatolik:", error);
    bot.sendMessage(chatId, "Ma'lumotlarni saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
}

module.exports = handleContact;