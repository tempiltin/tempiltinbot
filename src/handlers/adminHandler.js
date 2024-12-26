import { User } from '../models/User.js';

const ADMIN_ID = "5835759480";

export const isAdmin = (userId) => userId.toString() === ADMIN_ID;

export const handleAdminBroadcast = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(msg.from.id)) {
    return;
  }

  try {
    await bot.sendMessage(chatId, "Assalomu alaykum! Foydalanuvchilarga habar yuborish uchun menga xabar jo'nating");
    
    // Set admin state to waiting for broadcast message
    bot.once('message', async (msg) => {
      if (!isAdmin(msg.from.id)) return;
      
      const users = await User.find({ userId: { $ne: ADMIN_ID } });
      let successCount = 0;
      let failCount = 0;

      for (const user of users) {
        try {
          await bot.copyMessage(user.userId, chatId, msg.message_id);
          successCount++;
        } catch (err) {
          console.error(`Failed to send message to user ${user.userId}:`, err);
          failCount++;
        }
      }

      await bot.sendMessage(
        chatId,
        `Xabar yuborish yakunlandi:\n` +
        `✅ Muvaffaqiyatli: ${successCount} ta\n` +
        `❌ Muvaffaqiyatsiz: ${failCount} ta\n` +
        `📊 Jami: ${users.length} ta`
      );
    });
  } catch (error) {
    console.error('Admin broadcast error:', error);
    await bot.sendMessage(chatId, "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
};