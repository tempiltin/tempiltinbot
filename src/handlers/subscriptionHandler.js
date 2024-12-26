import { User } from '../models/User.js';

export const checkSubscription = async (bot, userId, channelId) => {
  try {
    const member = await bot.getChatMember(channelId, userId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch (error) {
    console.error('Subscription check error:', error);
    return false;
  }
};

export const handleSubscriptionCheck = async (bot, chatId, userId, channelId, channelUsername) => {
  try {
    const isSubscribed = await checkSubscription(bot, userId, channelId);
    
    if (isSubscribed) {
      await User.findOneAndUpdate(
        { userId: userId.toString() },
        { isSubscribed: true },
        { upsert: true }
      );

      return bot.sendMessage(chatId, "Telefon raqamingizni yuborish uchun quyidagi tugmani bosing:", {
        reply_markup: {
          keyboard: [[{ text: "Raqamni yuborish", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }

    return bot.sendMessage(chatId, "Botdan foydalanish uchun kanalga obuna bo'ling:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Obuna bo'lish", url: `https://t.me/${channelUsername}` }],
          [{ text: "Obunani tekshirish", callback_data: 'check_subscription' }]
        ]
      }
    });
  } catch (error) {
    console.error('Subscription handling error:', error);
    return bot.sendMessage(chatId, "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
};