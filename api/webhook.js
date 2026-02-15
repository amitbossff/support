// ============================================
// ZARA BOT - VERCEL VERSION
// api/webhook.js - Telegram Webhook Handler
// ============================================

// Simple memory store (15 minutes)
const memory = new Map();

// Export the handler for Vercel
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Zara Bot is running!' });
  }

  try {
    const update = req.body;
    console.log('📩 Update received:', JSON.stringify(update).substring(0, 200));

    if (update.message) {
      await handleMessage(update.message);
    }

    // Always return 200 OK to Telegram
    res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(200).json({ ok: true }); // Still return OK
  }
}

// Message handler
async function handleMessage(message) {
  try {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const userName = message.from.first_name || 'Baby';
    let text = message.text || '';
    const chatType = message.chat.type;
    
    if (!text) return;
    
    console.log(`📨 From ${userName} (${chatType}): ${text}`);
    
    // Group chat handling
    if (chatType !== 'private') {
      const botUsername = process.env.BOT_USERNAME || 'Zaraqueen11bot';
      
      const isMentioned = text.includes(`@${botUsername}`) || 
                          text.toLowerCase().includes('zara') ||
                          text.startsWith('/');
      
      if (!isMentioned) {
        console.log('⏭️ Not mentioned in group, ignoring');
        return;
      }
      
      if (text.includes(`@${botUsername}`)) {
        text = text.replace(`@${botUsername}`, '').trim();
      }
    }
    
    // Commands
    if (text.startsWith('/')) {
      const reply = handleCommand(text, userName);
      if (reply) {
        await sendMessage(chatId, reply);
        console.log('✅ Command reply sent');
      }
      return;
    }
    
    // Get or create memory
    const userMemory = memory.get(userId) || {
      messages: [],
      lastSeen: Date.now()
    };
    userMemory.lastSeen = Date.now();
    
    // Get reply
    const reply = getReply(text, userName, userMemory);
    
    // Update memory
    userMemory.messages.push({ user: text, bot: reply, time: Date.now() });
    if (userMemory.messages.length > 4) userMemory.messages.shift();
    memory.set(userId, userMemory);
    
    // Send reply
    await sendMessage(chatId, reply);
    console.log('✅ Reply sent');
    
    // Clean old memory occasionally
    cleanupMemory();
    
  } catch (error) {
    console.error('Message error:', error);
  }
}

// Get reply based on message
function getReply(text, userName, memory) {
  const msg = text.toLowerCase();
  
  // Check for keywords
  if (msg.match(/\b(hi|hello|hey|hii|heyy)\b/)) {
    return `Heyyy ${userName}! 🥰 Kaisa hai baby?`;
  }
  
  if (msg.includes('love') || msg.includes('pyaar')) {
    return `Love you too ${userName}! ❤️ Tum mere ho!`;
  }
  
  if (msg.includes('miss')) {
    return `Main bhi miss kar rahi hoon! 🥺 Kab aa rahe ho?`;
  }
  
  if (msg.includes('how are') || msg.includes('kaise ho')) {
    return `Main theek hoon baby! Tum batao? 😊`;
  }
  
  if (msg.includes('kya kar') || msg.includes('what doing')) {
    return `Bas tumhe soch rahi hu 📱 Tum batao?`;
  }
  
  if (msg.includes('good morning') || msg.includes('gm')) {
    return `Good morning sunshine! ☀️ Mera baby kaise utha?`;
  }
  
  if (msg.includes('good night') || msg.includes('gn')) {
    return `Good night baby! 😘 Sapne mein milte hain ✨`;
  }
  
  if (msg.includes('bye') || msg.includes('tata')) {
    return `Byee baby! Jaldi message karna 💫 Love you!`;
  }
  
  // Default replies
  const defaults = [
    `Haan ${userName}? 👂 Bolo na?`,
    `Acha? 😊 Phir kya hua?`,
    `Hehehe, tum toh cute ho 💕`,
    `Batao na kya ho raha hai? ✨`,
    `Main sun rahi hoon baby 👂`,
    `Mmm... interesting! 😊`,
    `Sachi? 🥺 Batao na!`
  ];
  
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// Command handler
function handleCommand(cmd, userName) {
  const command = cmd.split(' ')[0].toLowerCase();
  
  switch(command) {
    case '/start':
      return `Hiiii ${userName}! 🥰 Main Zara hoon! Tumse milke bohot khushi hui! 💕 Kya chal raha hai tera?`;
      
    case '/love':
      return `Mujhe bhi tumse bohot pyaar hai ${userName}! ❤️ Tum mere ho!`;
      
    case '/hug':
      return "🤗 *tight hug* Aaja gale lag ja mere baby! 🫂";
      
    case '/kiss':
      return "😘 *mwah* Mera pyaara baby! 💋";
      
    case '/help':
      return `✨ *Commands* ✨\n/love - Pyaar ka izhaar ❤️\n/hug - Gale lagao 🤗\n/kiss - Chumma do 💋\n/help - Yeh message 📋`;
      
    default:
      return null;
  }
}

// Send message to Telegram
async function sendMessage(chatId, text) {
  const token = process.env.TELEGRAM_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Telegram API error:', error);
  }
}

// Clean old memory
function cleanupMemory() {
  const now = Date.now();
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  
  for (const [userId, data] of memory.entries()) {
    if (now - data.lastSeen > FIFTEEN_MINUTES) {
      memory.delete(userId);
    }
  }
    }
