/**
 * Check if a user is a member of a channel
 * @param {TelegramBot} bot - The Telegram bot instance
 * @param {string} channelNumericId - The numeric ID of the channel
 * @param {number} userId - The user's Telegram ID
 * @returns {Promise<boolean>} - Whether the user is a member
 */
async function checkMembership(bot, channelNumericId, userId) {
  try {
    if (!bot || !channelNumericId || !userId) {
      throw new Error('Missing required parameters for checkMembership');
    }
    
    const res = await bot.getChatMember(channelNumericId, userId);
    return ['member', 'administrator', 'creator'].includes(res.status);
  } catch (error) {
    console.error("Error checking membership:", error);
    throw error;
  }
}

module.exports = { checkMembership };