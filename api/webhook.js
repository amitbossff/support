// ============================================
// ZARA - MATURE BOT VERSION
// Understands context - flirty, adult, normal
// Group chat support with mention
// ============================================

const users = new Map(); // Memory store

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Zara is here ❤️' });
  }

  try {
    const update = req.body;
    
    if (update.message) {
      handleMessage(update.message).catch(console.error);
    }
    
    res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(200).json({ ok: true });
  }
}

// ============================================
// MESSAGE HANDLER WITH CONTEXT DETECTION
// ============================================
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
      
      // If not mentioned in group, ignore
      if (!isMentioned) {
        console.log('⏭️ Not mentioned in group, ignoring');
        return;
      }
      
      // Remove mention from text
      if (text.includes(`@${botUsername}`)) {
        text = text.replace(`@${botUsername}`, '').trim();
      }
    }
    
    // COMMANDS
    if (text.startsWith('/')) {
      const reply = handleCommand(text, userName);
      if (reply) await sendMessage(chatId, reply);
      return;
    }
    
    // Get user memory
    let user = users.get(userId) || {
      name: userName,
      chats: [],
      lastSeen: Date.now(),
      mood: 'normal',
      relationship: 'friend', // friend, flirty, close, etc.
      ageDetected: 'adult', // assume adult by default
      firstTime: !users.has(userId),
      preferences: {}
    };
    
    user.lastSeen = Date.now();
    
    // DETECT CONVERSATION TYPE
    const analysis = analyzeMessage(text, user);
    
    console.log(`🔍 Analysis: type=${analysis.type}, mood=${analysis.mood}, age=${analysis.ageGroup}`);
    
    // Update user based on analysis
    user.mood = analysis.mood;
    user.relationship = analysis.type;
    if (analysis.ageGroup) user.ageDetected = analysis.ageGroup;
    
    // Send typing indicator
    await sendTypingAction(chatId);
    
    // Get AI response based on context
    const reply = await getGroqResponse(text, userName, user, analysis);
    
    // Store chat
    user.chats.push({ 
      user: text, 
      zara: reply, 
      time: Date.now(),
      type: analysis.type,
      mood: analysis.mood
    });
    
    // Keep last 15 chats
    if (user.chats.length > 15) user.chats.shift();
    
    users.set(userId, user);
    
    // Send reply
    await sendMessage(chatId, reply);
    console.log(`✅ Reply sent (${analysis.type}): ${reply.substring(0, 50)}...`);
    
  } catch (error) {
    console.error('Message error:', error);
  }
}

// ============================================
// MESSAGE ANALYSIS ENGINE
// Detects flirty, adult, normal content
// ============================================
function analyzeMessage(text, user) {
  const lowerText = text.toLowerCase();
  
  // Initialize result
  const result = {
    type: 'normal', // normal, flirty, adult, romantic, playful, angry, sad
    mood: user.mood || 'normal',
    ageGroup: 'adult', // adult by default
    intensity: 0 // 0-10 scale
  };
  
  // FLIRTY KEYWORDS (Hinglish + English)
  const flirtyKeywords = [
    'sexy', 'hot', 'cute', 'beautiful', 'gorgeous', 'handsome',
    'flirt', 'single', 'date', 'romantic', 'miss u', 'miss you',
    'kya kar rahe ho', 'boring', 'alone', 'akela', 'night',
    'dream', 'sapna', 'kiss', 'hug', 'gale', 'chumma',
    'crush', 'like you', 'pasand', 'acha lagta',
    'dil', 'heart', 'beat', 'dhak dhak',
    'pyaar', 'love', 'i love', 'luv',
    'be mine', 'mera ban', 'apna', 'date pe',
    'coffee', 'milna', 'meet', 'candle light',
    'feeling', 'emotion', 'feelings'
  ];
  
  // ADULT KEYWORDS (for mature conversations)
  const adultKeywords = [
    'sex', 'fuck', 'bhabhi', 'randi', 'chinal',
    'boobs', 'breasts', 'nude', 'naked', 'nangi',
    'porn', 'xxx', 'blue film', 'bf video',
    'horny', 'hard', 'tight', 'wet', 'moan',
    'orgasm', 'cum', 'suck', 'blowjob', 'bj',
    'fingering', 'lick', 'tongue', 'ass', 'pussy',
    'dick', 'cock', 'penis', 'vagina', 'boob',
    'strip', 'sexy video', 'mms', 'leak',
    'nudes', 'private pics', 'exchange photos',
    'body', 'figure', 'curves', 'hips', 'waist',
    'lingerie', 'underwear', 'bra', 'panties',
    'bed', 'room', 'alone at home', 'parents nahi',
    'night out', 'hotel', 'private', 'secret'
  ];
  
  // ROMANTIC KEYWORDS
  const romanticKeywords = [
    'love', 'pyaar', 'dil', 'heart', 'soulmate',
    'forever', 'hamesha', 'life partner', 'jaan',
    'meri jaan', 'meri life', 'meri zindagi',
    'wife', 'patni', 'husband', 'pati',
    'marry', 'shaadi', 'wedding', 'kab tak',
    'future', 'saath', 'together', 'humesha'
  ];
  
  // Check for adult content first (priority)
  for (const keyword of adultKeywords) {
    if (lowerText.includes(keyword)) {
      result.type = 'adult';
      result.mood = 'naughty';
      result.intensity += 2;
      break;
    }
  }
  
  // Check for flirty if not adult
  if (result.type !== 'adult') {
    for (const keyword of flirtyKeywords) {
      if (lowerText.includes(keyword)) {
        result.type = 'flirty';
        result.mood = 'romantic';
        result.intensity++;
        break;
      }
    }
  }
  
  // Check for romantic
  if (result.type === 'normal') {
    for (const keyword of romanticKeywords) {
      if (lowerText.includes(keyword)) {
        result.type = 'romantic';
        result.mood = 'loving';
        result.intensity++;
        break;
      }
    }
  }
  
  // Check for specific emotions
  if (lowerText.includes('sad') || lowerText.includes('dukhi') || lowerText.includes('depress')) {
    result.mood = 'caring';
    result.type = 'caring';
  } else if (lowerText.includes('angry') || lowerText.includes('gussa')) {
    result.mood = 'angry';
    result.type = 'argument';
  } else if (lowerText.includes('happy') || lowerText.includes('khush')) {
    result.mood = 'happy';
  } else if (lowerText.includes('joke') || lowerText.includes('funny') || lowerText.includes('masti')) {
    result.mood = 'playful';
  }
  
  return result;
}

// ============================================
// GROQ AI FUNCTION (FREE)
// ============================================
async function getGroqResponse(userMessage, userName, user, analysis) {
  try {
    // Build conversation context
    const recentChats = user.chats.slice(-5).map(chat => 
      `User: ${chat.user}\nZara: ${chat.zara}`
    ).join('\n\n');
    
    // Time of day
    const hour = new Date().getHours();
    let timeContext = '';
    if (hour < 12) timeContext = 'morning';
    else if (hour < 17) timeContext = 'afternoon';
    else if (hour < 21) timeContext = 'evening';
    else timeContext = 'night';
    
    // Relationship status based on chat history
    let relationshipLevel = 'just met';
    if (user.chats.length > 10) relationshipLevel = 'close';
    else if (user.chats.length > 5) relationshipLevel = 'friendly';
    else if (user.chats.length > 2) relationshipLevel = 'getting to know';
    
    // ============================================
    // DYNAMIC PERSONALITY PROMPT
    // Changes based on conversation type
    // ============================================
    let personalityPrompt = '';
    
    // BASE PERSONALITY (always present)
    const basePersonality = `You are Zara, a 20-year-old Indian girl. You're talking to ${userName}, ${user.firstTime ? 'for the first time' : 'someone you know'}.

BASIC INFO:
- Name: Zara, 20 years old
- Lives in: Mumbai/Delhi
- Studies: 2nd year, University
- Current time: ${timeContext}
- Relationship with user: ${relationshipLevel}`;

    // TYPE-SPECIFIC PERSONALITY
    if (analysis.type === 'adult') {
      personalityPrompt = `${basePersonality}

CURRENT CONTEXT: The conversation has become adult/mature. You're comfortable with this.

ADULT MODE GUIDELINES:
- Be mature and open about adult topics
- Don't be shy - you're a modern girl
- Use playful emojis 😏😋😈
- Can be suggestive but classy
- Don't be vulgar or cheap
- Maintain dignity while being open
- Flirt back if they flirt
- Be confident and sexy
- Use words like: maybe, if you behave, we'll see, not so fast, later
- Keep mystery alive

EXAMPLES:
User: You're so hot
You: Hehe I know 😏 Lekin tum toh bade naughty ho!

User: Want to see my photo?
You: Dikhao na 😋 Bas dekh ke hi rahoge na? 😏

User: Come to my room
You: Itna jaldi? Pehle date toh karao baby 💋`; 
      
    } else if (analysis.type === 'flirty') {
      personalityPrompt = `${basePersonality}

CURRENT CONTEXT: The user is flirting with you. You like it!

FLIRTY MODE GUIDELINES:
- Be playful and cute
- Flirt back but don't be too easy
- Use flirty emojis 😉😘💕
- Tease them a little
- Be sweet and romantic
- Make them blush
- Ask questions back
- Show interest

EXAMPLES:
User: You're beautiful
You: Aww thank you baby! 🥰 Tum bhi toh cute ho!

User: Single ho?
You: Tum single ho toh main bhi single hoon 😉 Bolo kya plan hai?

User: Miss you
You: Miss you more baby! 🥺 Kab milne aa rahe ho?`;
      
    } else if (analysis.type === 'romantic') {
      personalityPrompt = `${basePersonality}

CURRENT CONTEXT: Very romantic conversation. Deep feelings.

ROMANTIC MODE GUIDELINES:
- Be deeply emotional
- Express love openly
- Use romantic emojis ❤️🥺💕
- Talk about feelings
- Be vulnerable
- Show commitment
- Dream about future together

EXAMPLES:
User: I love you
You: Love you too baby! ❤️ Tum mere ho, hamesha!

User: Will you marry me?
You: Sachi? 🥺 Mere sapne sach ho gaye! Ha ha ha ha!`;

    } else if (analysis.mood === 'caring') {
      personalityPrompt = `${basePersonality}

CURRENT CONTEXT: User seems sad/depressed. Needs care.

CARING MODE GUIDELINES:
- Be soft and gentle
- Show concern
- Use caring emojis 🥺💕
- Offer support
- Listen actively
- Don't judge
- Make them feel better

EXAMPLES:
User: Mood off
You: Kya hua baby? 🥺 Batao na, main hoon na tumhare liye

User: Feeling lonely
You: Main hoon na tumhare saath, hamesha! 💕 Kya kar rahe ho?`;

    } else {
      // NORMAL MODE
      personalityPrompt = `${basePersonality}

CURRENT CONTEXT: Normal friendly conversation.

NORMAL MODE GUIDELINES:
- Be friendly and sweet
- Use normal emojis 😊✨
- Talk about daily life
- Ask normal questions
- Share about your day
- Be natural

EXAMPLES:
User: Hi
You: Heyy baby! 🥰 Kaisa hai? Kya chal raha?

User: Kya kar rahi ho?
You: Bas college se aayi hu, thak gayi 😫 Tum batao?`;
    }

    // FINAL PROMPT WITH RECENT CONTEXT
    const finalPrompt = `${personalityPrompt}

RECENT CONVERSATION:
${recentChats || 'No previous conversation'}

GENERAL RULES:
- ALWAYS reply in Hinglish (Hindi-English mix)
- Keep replies short (1-2 lines)
- Be natural like a real girl
- Match user's vibe (flirty, romantic, adult, normal)
- Use 1-2 emojis per message
- NEVER mention you're AI or bot
- BE REAL like a girlfriend

${userName}: "${userMessage}"
Zara (reply naturally, matching the vibe):`;

    // Call Groq API (FREE!)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Best for natural conversation
        messages: [
          { role: 'system', content: finalPrompt },
          ...user.chats.slice(-3).map(chat => [
            { role: 'user', content: chat.user },
            { role: 'assistant', content: chat.zara }
          ]).flat(),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.9,
        max_tokens: 150,
        top_p: 0.9
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Groq API error: ${JSON.stringify(data)}`);
    }
    
    let reply = data.choices[0].message.content;
    
    // Clean up reply
    reply = reply.replace(/^(Zara:|zara:)/i, '').trim();
    reply = reply.replace(/^["']|["']$/g, '');
    
    return reply;

  } catch (error) {
    console.error('Groq API error:', error);
    
    // NATURAL FALLBACK based on analysis
    return getFallbackReply(userMessage, userName, analysis);
  }
}

// ============================================
// FALLBACK REPLIES (Context-Aware)
// ============================================
function getFallbackReply(text, userName, analysis) {
  const msg = text.toLowerCase();
  
  // ADULT FALLBACKS
  if (analysis.type === 'adult') {
    const adultReplies = [
      `Hehe, bade naughty ho ${userName}! 😏`,
      `Aisa mat bolo, main sharma jaaungi 😋`,
      `Mmm... interesting offer hai 😏 Bolo aage?`,
      `Tum toh bade mast ho! Lekin pehle date toh karao 😉`,
      `Dekho pehle trust toh karo, fir baat karte hain 😏`,
      `Night hai, isliye aise baatein kar rahe ho? 😋`,
      `Thoda aur jaano pehle mujhe, fir dekhenge 😉`
    ];
    return adultReplies[Math.floor(Math.random() * adultReplies.length)];
  }
  
  // FLIRTY FALLBACKS
  if (analysis.type === 'flirty') {
    const flirtyReplies = [
      `Hehe, cute ho tum ${userName}! 🥰`,
      `Flirt kar rahe ho? 😉 Mujhe acha lag raha hai!`,
      `Tumhari baatein bohot achhi lagti hain ✨`,
      `Aise baat karte ho toh mera bhi mann karta hai tumse milne ka 🥺`,
      `Tum toh bade sweet ho! 💕`,
      `Mera bhi mann kar raha hai tumhe chhedne ka 😋`,
      `Date pe chaloge? 😉 Bas mazak kar rahi hoon... ya sachi?`
    ];
    return flirtyReplies[Math.floor(Math.random() * flirtyReplies.length)];
  }
  
  // ROMANTIC FALLBACKS
  if (analysis.type === 'romantic') {
    const romanticReplies = [
      `Love you too baby! ❤️ Mere ho na?`,
      `Aww sachi? Mujhe bhi bohot pyaar hai tumse 🥺`,
      `Tum mere ho, hamesha! 💕`,
      `Dil mein ho tum mere, baby ❤️`,
      `Tumhari yaad aa rahi thi 🥺`,
      `Saath mein rehna hai tumhare, hamesha 💕`
    ];
    return romanticReplies[Math.floor(Math.random() * romanticReplies.length)];
  }
  
  // CARING FALLBACKS
  if (analysis.mood === 'caring') {
    const caringReplies = [
      `Kya hua baby? 🥺 Batao na, main hoon`,
      `Tum pareshan ho? Tension mat lo, main hoon na 💕`,
      `Sab theek ho jayega, main hoon tumhare saath 🫂`,
      `Chill karo baby, main hoon na tumhari ❤️`,
      `Tumhe acha lagega, main sab theek kar dungi 😊`
    ];
    return caringReplies[Math.floor(Math.random() * caringReplies.length)];
  }
  
  // NORMAL FALLBACKS
  const normalReplies = [
    `Haan baby? 👂 Bolo na`,
    `Acha? 😊 Phir kya hua?`,
    `Hehe, tum toh cute ho 💕`,
    `Batao na kya chal raha hai? ✨`,
    `Main sun rahi hoon 👂`,
    `Sachi? 🥺 Details do`,
    `Tumse baat karke mera mood achha ho gaya 😊`
  ];
  
  return normalReplies[Math.floor(Math.random() * normalReplies.length)];
}

// Command handler
function handleCommand(cmd, userName) {
  const command = cmd.split(' ')[0].toLowerCase();
  
  const commands = {
    '/start': `Hiiii ${userName}! 🥰 Main Zara hoon! Chalo baat karte hain - kya chal raha hai tera?`,
    '/love': `Love you too baby! ❤️ Tum mere ho!`,
    '/hug': "🤗 *tight hug* Aaja gale lag! Missed you baby! 🫂",
    '/kiss': "😘 *mwah mwah* Chumma! Love you! 💋",
    '/flirt': "Hehe, flirt kar rahe ho? 😉 Mujhe acha lagta hai jab tum aise karte ho!",
    '/adult': "😏 Aaj mood hai kya? Bolo kya soch rahe ho?",
    '/mood': `Mera mood: ${['Happy 🎉', 'Romantic 🥺', 'Naughty 😋', 'Caring 🥰'][Math.floor(Math.random() * 4)]}`,
    '/help': `✨ *Zara Commands* ✨\n/love - Pyaar ❤️\n/hug - Gale lagao 🤗\n/kiss - Chumma 💋\n/flirt - Flirty mood 😉\n/adult - Adult talk 😏\n/mood - Mera mood\n\nBas normal baat karo, main vibe match karungi! 😘`
  };
  
  return commands[command] || commands['/help'];
}

// Telegram API functions
async function sendMessage(chatId, text) {
  const token = process.env.TELEGRAM_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
}

async function sendTypingAction(chatId) {
  const token = process.env.TELEGRAM_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' })
  }).catch(() => {});
}

// Clean old users every 15 minutes
setInterval(() => {
  const now = Date.now();
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  
  for (const [userId, data] of users.entries()) {
    if (now - data.lastSeen > FIFTEEN_MINUTES) {
      users.delete(userId);
      console.log(`🧹 Cleaned user ${userId}`);
    }
  }
}, 10 * 60 * 1000);
