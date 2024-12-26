import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database.js';
import { handleContact } from './src/handlers/contactHandler.js';
import { handleSubscriptionCheck } from './src/handlers/subscriptionHandler.js';
import { handleAdminBroadcast, isAdmin } from './src/handlers/adminHandler.js';
import { User } from './src/models/User.js';

dotenv.config();

const token = process.env.BOT_TOKEN;
const channelId = process.env.CHANNELNUMERICID;
const channelUsername = process.env.CHANNEL_ID;

const bot = new TelegramBot(token, { polling: true });

// Connect to MongoDB
connectDB();

// Start command handler
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const user = await User.findOne({ userId: userId.toString() });
    
    if (user && user.phone) {
      await handleSubscriptionCheck(bot, chatId, userId, channelId, channelUsername);
    } else {
      await handleSubscriptionCheck(bot, chatId, userId, channelId, channelUsername);
    }
  } catch (error) {
    console.error('Start command error:', error);
    bot.sendMessage(chatId, "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
});

// Admin broadcast command
bot.onText(/\/send-user-post/, async (msg) => {
  if (isAdmin(msg.from.id)) {
    await handleAdminBroadcast(bot, msg);
  }
});

// Contact message handler
bot.on('contact', async (msg) => {
  await handleContact(bot, msg);
});

// Callback query handler
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === 'check_subscription') {
    await handleSubscriptionCheck(bot, chatId, userId, channelId, channelUsername);
  }
});

console.log('Bot started successfully');