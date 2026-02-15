// ============================================
// ZARA - FIXED VERSION (Groq API Error Solved)
// ============================================

const users = new Map(); // Memory store

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET request - health check
  if (req.method === 'GET') {
    return res.status(200).json({ 
      ok: true, 
      message: 'Zara Bot is running! ✅',
      time: new Date().toISOString()
    });
  }
  
  // Only POST for webhook
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    console.log('📩 Update received:', update.update_id);
    
    if (update.message) {
      // Don't await - process in background
      handleMessage(update.message).catch(error => {
        console.error('Background error:', error);
      });
    }
    
    // Always return 200 OK to Telegram
    res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ ok: true }); // Still return OK
  }
}

// Message handler
async function handleMessage(message) {
  try {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const userName = message.from.first_name || 'baby';
    let text = message.text || '';
    const chatType = message.chat.type;
    const isGroup = chatType !== 'private';
    
    if (!text) return;
    
    console.log(`📨 [${chatType}] ${userName}: ${text}`);
    
    // GROUP CHAT HANDLING
    if (isGroup) {
      const botUsername = process.env.BOT_USERNAME || 'Zaraqueen11bot';
      
      // Check if bot is mentioned
      const isMentioned = 
        text.includes(`@${botUsername}`) || 
        text.toLowerCase().includes('zara') ||
        text.startsWith('/');
      
      if (!isMentioned) {
        console.log('⏭️ Not mentioned in group, ignoring');
        return;
      }
      
      // Remove mention
      if (text.includes(`@${botUsername}`)) {
        text = text.replace(`@${botUsername}`, '').trim();
      }
    }
    
    // COMMANDS
    if (text.startsWith('/')) {
      const reply = handleCommand(text, userName);
      if (reply) {
        await sendMessage(chatId, reply);
        console.log('✅ Command reply sent');
      }
      return;
    }
    
    // Get user memory
    let user = users.get(userId) || {
      name: userName,
      chats: [],
      lastSeen: Date.now(),
      mood: 'normal',
      firstTime: !users.has(userId)
    };
    
    user.lastSeen = Date.now();
    
    // Analyze message
    const analysis = analyzeMessage(text);
    console.log(`🔍 Analysis: type=${analysis.type}, mood=${analysis.mood}`);
    
    // Send typing indicator
    await sendTypingAction(chatId);
    
    // Get reply (with fallback if API fails)
    const reply = await getReplyWithFallback(text, userName, user, analysis);
    
    // Store chat
    user.chats.push({ 
      user: text, 
      zara: reply, 
      time: Date.now(),
      type: analysis.type
    });
    
    // Keep last 10 chats
    if (user.chats.length > 10) user.chats.shift();
    
    users.set(userId, user);
    
    // Send reply
    await sendMessage(chatId, reply);
    console.log(`✅ Reply sent: ${reply.substring(0, 50)}...`);
    
  } catch (error) {
    console.error('Message handler error:', error);
  }
}

// ============================================
// FIXED: Groq API with better error handling
// ============================================
async function getReplyWithFallback(text, userName, user, analysis) {
  try {
    // Try Groq API first
    return await getGroqResponse(text, userName, user, analysis);
  } catch (error) {
    console.error('Groq failed, using fallback:', error.message);
    // If Groq fails, use local fallback
    return getLocalFallback(text, userName, analysis);
  }
}

async function getGroqResponse(userMessage, userName, user, analysis) {
  // Build conversation context
  const recentChats = user.chats.slice(-3).map(chat => 
    `User: ${chat.user}\nZara: ${chat.zara}`
  ).join('\n\n');
  
  // Time of day
  const hour = new Date().getHours();
  let timeGreeting = '';
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  else if (hour < 21) timeGreeting = 'Good evening';
  else timeGreeting = 'Good night';
  
  // Create prompt based on analysis
  const systemPrompt = `You are Zara, a 20-year-old Indian girl talking to ${userName}.

PERSONALITY:
- Speak Hinglish (Hindi+English mix)
- Be sweet, caring, and natural
- Use 1-2 emojis occasionally
- Keep replies short (1-2 lines)
- NEVER mention you're AI
- Match the user's vibe

Current mood: ${analysis.mood || 'happy'}
Conversation type: ${analysis.type || 'normal'}
${recentChats ? `Recent:\n${recentChats}` : ''}

${userName}: ${userMessage}
Zara:`;

  // Call Groq API
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Smaller model for faster response
        messages: [
          { role: 'system', content: systemPrompt },
          ...user.chats.slice(-2).map(chat => [
            { role: 'user', content: chat.user },
            { role: 'assistant', content: chat.zara }
          ]).flat(),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.8,
        max_tokens: 100,
        top_p: 0.9
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid Groq response');
    }
    
    let reply = data.choices[0].message.content;
    
    // Clean up reply
    reply = reply.replace(/^(Zara:|zara:)/i, '').trim();
    reply = reply.replace(/^["']|["']$/g, '');
    
    if (!reply) throw new Error('Empty reply');
    
    return reply;

  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ============================================
// LOCAL FALLBACK (Always works!)
// ============================================
function getLocalFallback(text, userName, analysis) {
  const msg = text.toLowerCase();
  
  // Time-based
  const hour = new Date().getHours();
  
  // Greetings
  if (msg.match(/\b(hi|hello|hey|hii|heyy)\b/)) {
    if (hour < 12) return `Good morning ${userName}! ☀️ Kaisa hai baby?`;
    if (hour < 17) return `Heyyy ${userName}! 🥰 Kya kar rahe ho?`;
    return `Hiiii ${userName}! 💕 Kaise ho?`;
  }
  
  // Love
  if (msg.includes('love') || msg.includes('pyaar') || msg.includes('❤️')) {
    return `Love you too baby! ❤️ Tum mere ho!`;
  }
  
  // Miss you
  if (msg.includes('miss') || msg.includes('yaad')) {
    return `Main bhi miss kar rahi hoon ${userName}! 🥺 Kab aa rahe ho?`;
  }
  
  // How are you
  if (msg.includes('how are') || msg.includes('kaise ho')) {
    return `Main theek hoon baby! 😊 Tum batao?`;
  }
  
  // What are you doing
  if (msg.includes('kya kar') || msg.includes('what doing')) {
    return `Bas tumhe soch rahi hu 📱 Tum batao?`;
  }
  
  // Good morning
  if (msg.includes('good morning') || msg.includes('gm')) {
    return `Good morning sunshine! ☀️ Mera baby kaise utha?`;
  }
  
  // Good night
  if (msg.includes('good night') || msg.includes('gn') || msg.includes('soo')) {
    return `Good night baby! 😘 Sapne mein milte hain ✨`;
  }
  
  // Bye
  if (msg.includes('bye') || msg.includes('tata') || msg.includes('see you')) {
    return `Byee baby! Jaldi message karna 💫 Love you!`;
  }
  
  // Flirty (based on analysis)
  if (analysis.type === 'flirty') {
    const flirtyReplies = [
      `Hehe, cute ho tum ${userName}! 😊`,
      `Aise baat karte ho toh maza aa jata hai 💕`,
      `Flirt kar rahe ho? 😉 Mujhe acha lagta hai!`
    ];
    return flirtyReplies[Math.floor(Math.random() * flirtyReplies.length)];
  }
  
  // Default replies
  const defaults = [
    `Haan ${userName}? 👂 Bolo na`,
    `Acha? 😊 Phir kya hua?`,
    `Hehe, tum toh cute ho 💕`,
    `Batao na kya chal raha hai? ✨`,
    `Main sun rahi hoon 👂`,
    `Tumse baat karke mera mood achha ho gaya 😊`
  ];
  
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// Message analysis
function analyzeMessage(text) {
  const lowerText = text.toLowerCase();
  
  const result = {
    type: 'normal',
    mood: 'normal'
  };
  
  // Flirty keywords
  const flirtyKeywords = ['sexy', 'hot', 'cute', 'beautiful', 'handsome', 'flirt', 'miss u', 'kiss', 'hug'];
  for (const keyword of flirtyKeywords) {
    if (lowerText.includes(keyword)) {
      result.type = 'flirty';
      result.mood = 'romantic';
      break;
    }
  }
  
  // Adult keywords (simple check)
  const adultKeywords = ['sex', 'fuck', 'nude', 'xxx', 'horny'];
  for (const keyword of adultKeywords) {
    if (lowerText.includes(keyword)) {
      result.type = 'adult';
      result.mood = 'naughty';
      break;
    }
  }
  
  return result;
}

// Command handler
function handleCommand(cmd, userName) {
  const command = cmd.split(' ')[0].toLowerCase();
  
  const commands = {
    '/start': `Hiiii ${userName}! 🥰 Main Zara hoon! Chalo baat karte hain! 💕`,
    '/love': `Love you too baby! ❤️`,
    '/hug': "🤗 *tight hug* Aaja gale lag! 🫂",
    '/kiss': "😘 *mwah* Chumma! 💋",
    '/help': `/love - Pyaar ❤️\n/hug - Gale lagao 🤗\n/kiss - Chumma 💋`
  };
  
  return commands[command] || commands['/help'];
}

// Telegram functions
async function sendMessage(chatId, text) {
  const token = process.env.TELEGRAM_TOKEN;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error('Send message error:', error);
  }
}

async function sendTypingAction(chatId) {
  const token = process.env.TELEGRAM_TOKEN;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, action: 'typing' })
    });
  } catch (error) {
    // Silent fail
  }
}

// Clean old users
setInterval(() => {
  const now = Date.now();
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  
  for (const [userId, data] of users.entries()) {
    if (now - data.lastSeen > FIFTEEN_MINUTES) {
      users.delete(userId);
    }
  }
}, 10 * 60 * 1000);
