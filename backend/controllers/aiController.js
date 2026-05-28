const User = require('../models/User');

// Standalone High-Fidelity Local Travel Simulator Engine
const generateFallbackReply = (userText) => {
  const lowercaseText = userText.toLowerCase();

  // A. Parse Destination
  let destination = 'Kyoto, Japan';
  if (lowercaseText.includes('tokyo')) destination = 'Tokyo, Japan';
  else if (lowercaseText.includes('paris')) destination = 'Paris, France';
  else if (lowercaseText.includes('rome')) destination = 'Rome, Italy';
  else if (lowercaseText.includes('bali')) destination = 'Bali, Indonesia';
  else if (lowercaseText.includes('london')) destination = 'London, UK';
  else if (lowercaseText.includes('new york') || lowercaseText.includes(' nyc')) destination = 'New York City, USA';
  else if (lowercaseText.includes('goa')) destination = 'Goa, India';
  else if (lowercaseText.includes('kyoto')) destination = 'Kyoto, Japan';
  else {
    // Capture custom destination if they asked e.g., "go to X" or "trip to X"
    const match = userText.match(/to\s+([A-Za-z\s]+)(for|with|in|\?|$)/i);
    if (match && match[1]) {
      destination = match[1].trim();
    }
  }

  // B. Parse Budget Tier
  let budgetTier = 'mid'; // default
  if (
    lowercaseText.includes('backpacker') ||
    lowercaseText.includes('cheap') ||
    lowercaseText.includes('budget') ||
    lowercaseText.includes('hostel') ||
    lowercaseText.includes('low') ||
    /\b(under\s+)?\$?(50|100|200|300|400|500)\b/.test(lowercaseText)
  ) {
    budgetTier = 'budget';
  } else if (
    lowercaseText.includes('luxury') ||
    lowercaseText.includes('premium') ||
    lowercaseText.includes('expensive') ||
    lowercaseText.includes('boutique') ||
    lowercaseText.includes('high end') ||
    /\b\$?(3000|4000|5000|10000)\b/.test(lowercaseText)
  ) {
    budgetTier = 'luxury';
  }

  // Parse custom duration/days requested by the traveler
  let days = 3; // default
  const dayMatch = lowercaseText.match(/\b(\d+)\s*day/);
  if (dayMatch && dayMatch[1]) {
    days = parseInt(dayMatch[1], 10);
  }

  // C. Pre-baked Custom Destination Details
  const tokyoData = {
    budget: {
      budget: {
        hotels: [
          { name: 'Nui. Hostel & Bar Lounge (Kuramae)', price: '$35/night', desc: 'Sleek, industrial design with an amazing ground-floor community cafe & bar. Perfect for meeting fellow travelers.' },
          { name: 'UNPLAN Shinjuku', price: '$42/night', desc: 'Ultra-modern capsule beds in the heart of Shinjuku with a vibrant social rooftop.' }
        ],
        activities: 'Browse vintage fashion in Shimokitazawa, eat cheap yakitori in Omoide Yokocho, and explore the neon lights of Shinjuku.'
      },
      mid: {
        hotels: [
          { name: 'Hotel Gracery Shinjuku (Godzilla Hotel)', price: '$180/night', desc: 'Vibrant boutique hotel famous for the massive Godzilla head overlooking Kabukicho.' },
          { name: 'The Knot Tokyo Shinjuku', price: '$220/night', desc: 'Art-focused design hotel with stunning park views, bakery, and local craft beer bar.' }
        ],
        activities: 'Cross Shibuya Crossing, visit Meiji Shrine, take a cooking masterclass in Tsukiji Outer Market, and sip cocktails in Golden Gai.'
      },
      luxury: {
        hotels: [
          { name: 'Aman Tokyo (Otemachi)', price: '$1,200/night', desc: 'An absolute architectural masterpiece blending traditional ryokan aesthetics with sky-high luxury views.' },
          { name: 'Park Hyatt Tokyo', price: '$850/night', desc: 'The iconic high-rise sanctuary from "Lost in Translation", featuring an legendary New York Bar.' }
        ],
        activities: 'Private sushi tour with a Michelin-starred chef, shopping in Ginza boutiques, and helicopter tour over Tokyo Bay.'
      }
    },
    itinerary: [
      '**Day 1: Neon Lights & Pop Culture**\nExplore Shibuya Crossing and Harajuku’s Takeshita Street in the morning. Enjoy lunch in Yoyogi Park, then head to Shinjuku in the evening to witness the neon skyline and Golden Gai tiny bars.',
      '**Day 2: Historic Temples & Modern Art**\nVisit Senso-ji temple in Asakusa, Tokyo’s oldest temple. Cross the Sumida River to visit teamLab Planets, an immersive digital art museum where you walk through water!',
      '**Day 3: Coastal Views & Tech Haven**\nSpend the morning browsing Tsukiji Outer Market for fresh street eats. Afternoon shopping in Ginza or Akihabara tech town, and catch the sunset from the Tokyo Skytree.'
    ]
  };

  const parisData = {
    budget: {
      budget: {
        hotels: [
          { name: 'Les Piaules Nation Hostel', price: '$38/night', desc: 'Premium custom bunk pods with a trendy Parisian rooftop bar and local craft beers.' },
          { name: 'Generator Paris', price: '$45/night', desc: 'Vibrant hostel in the Canal Saint-Martin district, featuring chic design and a basement club.' }
        ],
        activities: 'Buy baguettes and cheese for a picnic on the Seine bank, explore the charming hills of Montmartre, and view the Eiffel Tower from Trocadéro.'
      },
      mid: {
        hotels: [
          { name: 'Hotel Caron de Beaumarchais (Le Marais)', price: '$195/night', desc: 'Exquisite 18th-century themed boutique hotel located in the historical, artistic Marais district.' },
          { name: 'Hotel COQ Paris', price: '$170/night', desc: 'Chic, cozy hotel in the 13th Arrondissement, boasting a secret winter garden conservatory.' }
        ],
        activities: 'Visit the Louvre Museum (pre-booked ticket), enjoy espresso at Cafe de Flore, and take a evening sunset river cruise.'
      },
      luxury: {
        hotels: [
          { name: 'Hôtel Plaza Athénée', price: '$1,400/night', desc: 'Iconic palace on Avenue Montaigne with red awnings and breathtaking balcony views of the Eiffel Tower.' },
          { name: 'Le Bristol Paris', price: '$1,100/night', desc: 'Legendary luxury boasting a gorgeous indoor swimming pool resembling a yacht and a 3-Michelin-starred restaurant.' }
        ],
        activities: 'Private curator-led VIP tour of Versailles, luxury shopping on Champs-Élysées, and a 7-course culinary dinner in the Eiffel Tower.'
      }
    },
    itinerary: [
      '**Day 1: The Heart of Paris**\nStart at the majestic Arc de Triomphe, stroll down the Champs-Élysées, and explore the Louvre Museum. Finish with a romantic picnic by the Seine riverbanks.',
      '**Day 2: Montmartre & Eiffel Tower Vibe**\nAscend the Sacré-Cœur Basilica in Montmartre to see panoramic views. Sip espresso at a street corner cafe, then head to Champ de Mars to watch the Eiffel Tower sparkle after sunset.',
      '**Day 3: Bohemian Latin Quarter & Marais**\nExplore the winding medieval streets of Saint-Germain-des-Prés, visit the Shakespeare and Company bookstore, and enjoy vintage shopping in Le Marais.'
    ]
  };

  const baliData = {
    budget: {
      budget: {
        hotels: [
          { name: 'Lay Day Surf Hostel (Canggu)', price: '$12/night', desc: 'Vibrant pool deck social hostel run by surfers, perfect for solo travelers.' },
          { name: 'Arya Wellness Retreat (Ubud)', price: '$18/night', desc: 'Boutique wellness-focused hostel offering daily yoga, massage rooms, and organic food.' }
        ],
        activities: 'Rent a scooter to explore Ubud’s emerald rice terraces, watch the sunset at Canggu Beach, and eat delicious local Mie Goreng at warungs.'
      },
      mid: {
        hotels: [
          { name: 'Bambu Indah (Ubud)', price: '$140/night', desc: 'Eco-luxury boutique resort built of antique Javanese teak houses, overlooking pristine river valleys.' },
          { name: 'The Slow (Canggu)', price: '$175/night', desc: 'Ultra-cool, art-focused boutique hotel situated walking distance to Canggu’s surf breaks.' }
        ],
        activities: 'Take a private surf lesson, visit the sacred Monkey Forest, and enjoy a traditional Balinese spa ritual.'
      },
      luxury: {
        hotels: [
          { name: 'Four Seasons Resort Bali at Sayan', price: '$950/night', desc: 'A stunning architectural sanctuary suspended over the sacred Ayung River valley in Ubud.' },
          { name: 'Alila Villas Uluwatu', price: '$820/night', desc: 'Architecturally striking clifftop villas featuring infinity pools overlooking the Indian Ocean.' }
        ],
        activities: 'Private yacht charter around Nusa Penida islands, VIP sunset cocktails at clifftop beach clubs, and helicopter tour over active volcanic calderas.'
      }
    },
    itinerary: [
      '**Day 1: Spiritual Ubud Jungles**\nWake up early for a sunrise yoga session. Hike the Campuhan Ridge Walk, visit the Ubud Sacred Monkey Forest, and explore local woodcarving markets.',
      '**Day 2: Rice Terraces & Waterfalls**\nExplore the famous Tegallalang Rice Terraces, take a swing over the valley, and cool off under the mist of Kanto Lampo or Tegenungan waterfall.',
      '**Day 3: Uluwatu Cliffs & Sunsets**\nHead south to Uluwatu. Spend the day swimming in Padang Padang beach, and watch the legendary Kecak Fire Dance at the Uluwatu Clifftop Temple at sunset.'
    ]
  };

  const getGenericDetails = (dest) => {
    const lowercaseDest = dest.toLowerCase();
    
    let budgetAct = 'Free walking city tours, browsing local flea markets, dining at street food vendors, and watching sunsets from public parks.';
    let midAct = 'Guided historic tours, booking local cooking masterclasses, visiting art museums, and enjoying wine-pairings at neighborhood bistros.';
    let luxAct = 'Private chauffeured luxury car tours, exclusive yacht charters, private culinary dinners with local master chefs, and VIP access to cultural events.';
    
    let budgetHotels = [
      { name: `Backpackers Inn ${dest}`, price: '$20/night', desc: 'Highly-rated social hostel with custom dorm pods and free walking tours.' },
      { name: `The Local Nomad Lodge`, price: '$28/night', desc: 'Cozy guest house with organic breakfasts, bicycle rentals, and local travel vibes.' }
    ];
    let midHotels = [
      { name: `The Boutique Hotel ${dest}`, price: '$110/night', desc: 'Charming, design-focused hotel located in the historical downtown area with locally curated art.' },
      { name: `The Garden Vista Inn`, price: '$135/night', desc: 'Elegant hotel featuring beautifully landscaped courtyard pools and local fusion bistros.' }
    ];
    let luxHotels = [
      { name: `The Grand Palace & Spa ${dest}`, price: '$650/night', desc: 'Ultra-exclusive 5-star resort boasting premium private suites, award-winning spa, and 24/7 personal butler service.' },
      { name: `The Royal Vista Resort`, price: '$720/night', desc: 'Breathtaking clifftop villas featuring private heated infinity pools and Michelin-starred dining gardens.' }
    ];

    if (
      lowercaseDest.includes('munnar') ||
      lowercaseDest.includes('munnare') ||
      lowercaseDest.includes('munar') ||
      lowercaseDest.includes('kerala')
    ) {
      budgetAct = 'Walk through lush green tea gardens, capture mist at Photo Point, and enjoy spicy local street snacks.';
      midAct = 'Visit Eravikulam National Park to see rare Nilgiri Tahr mountain goats, boat ride at Mattupetty Dam, and explore spice gardens.';
      luxAct = 'Private 4x4 off-road jeep safari to Kolukkumalai tea estate (highest in the world) for sunrise, and high-tea on tea garden terraces.';
      
      budgetHotels = [
        { name: 'Munnar Backpackers Social Hostel', price: '₹950/night', desc: 'Charming hostel nested inside lush tea valleys, boasting evening campfires and local trekking guides.' },
        { name: 'The Green Ridge Retreat', price: '₹2,100/night', desc: 'Eco-lodge overlooking cardamom plantations with standard rooms and organic breakfast.' }
      ];
      midHotels = [
        { name: 'The Leaf Resort Munnar (Boutique)', price: '₹4,500/night', desc: 'Gorgeous cottage retreat with infinity pools and private balconies opening to tea gardens.' },
        { name: 'Amber Dale Luxury Hotel', price: '₹6,800/night', desc: 'Stunning cliffside hotel offering warm wooden interiors and spa treatments facing deep valleys.' }
      ];
      luxHotels = [
        { name: 'Blanket Hotel & Spa Munnar', price: '₹14,500/night', desc: 'Ultra-luxurious 5-star riverfront property facing Attukad Waterfalls with dedicated butler service.' },
        { name: 'Windermere Estate (Luxury Bungalow)', price: '₹18,000/night', desc: 'Charming colonial-era luxury farm estate sitting on an 18-acre cardamom and coffee plantation.' }
      ];
    } 
    else if (lowercaseDest.includes('goa')) {
      budgetAct = 'Relax on Baga and Anjuna beaches, watch sunset at Chapora Fort, and explore street food stalls.';
      midAct = 'Take a guided heritage tour of Old Goa churches, visit Dudhsagar waterfalls, and explore tropical spice plantations.';
      luxAct = 'Private yacht charter in Mandovi river, exclusive fine-dining at Latin Quarter (Fontainhas), and clifftop beach club access.';
      
      budgetHotels = [
        { name: 'Goa Surf Hostel (Anjuna)', price: '₹850/night', desc: 'Social surf hostel walking distance from the beach, featuring beach barbecues.' },
        { name: 'The Village Inn Calangute', price: '₹1,800/night', desc: 'Cozy, traditional Goan guest house with organic breakfasts and bicycle rentals.' }
      ];
      midHotels = [
        { name: 'Welcomheritage Panjim Inn (Fontainhas)', price: '₹4,200/night', desc: 'Historical 130-year-old Portuguese mansion decorated with colonial antiques and art gallery.' },
        { name: 'Planet Hollywood Beach Resort', price: '₹7,500/night', desc: 'Vibrant boutique beach resort in South Goa with beautiful pools and direct beach access.' }
      ];
      luxHotels = [
        { name: 'Taj Exotica Resort & Spa Goa', price: '₹18,000/night', desc: 'Legendary Mediterranean-style beach resort sitting on 56 acres of lush gardens along Benaulim Beach.' },
        { name: 'The Leela Goa (Cavelossim)', price: '₹22,000/night', desc: 'Absolute pinnacle of luxury, nestled between active lagoons and the blue Arabian Sea.' }
      ];
    }

    return {
      hotels: budgetHotels,
      activities: budgetAct,
      luxuryHotels: luxHotels,
      luxuryActivities: luxAct,
      midHotels: midHotels,
      midActivities: midAct
    };
  };

  let destDetails;
  if (destination.includes('Tokyo')) destDetails = tokyoData;
  else if (destination.includes('Paris')) destDetails = parisData;
  else if (destination.includes('Bali')) destDetails = baliData;
  else {
    const gen = getGenericDetails(destination);
    
    destDetails = {
      budget: {
        budget: { hotels: gen.hotels, activities: gen.activities },
        mid: { hotels: gen.midHotels, activities: gen.midActivities },
        luxury: { hotels: gen.luxuryHotels, activities: gen.luxuryActivities }
      },
      itinerary: [
        `**Day 1: Welcome to ${destination} & Local Vibe**\nCheck into your hotel. Get your bearings by walking through ${destination}'s historical core, visit local food stalls, and catch a beautiful evening sunset.`,
        `**Day 2: Scenic Highlights & Cardamom Trails**\nTake an early morning guided sightseeing tour of ${destination}'s famous view points, dams, or forests. Stroll through the local spice trails and cardamom gardens.`,
        `**Day 3: Culinary Delights & Hidden Gems**\nBrowse bustling local marketplaces in ${destination}. Take a culinary cooking masterclass, and seek out a hidden gem cafe recommended by our Voya matched travelers.`
      ]
    };
  }

  const matchedTierData = destDetails.budget[budgetTier] || destDetails.budget['mid'];

  const itineraryList = [...destDetails.itinerary];
  if (days > itineraryList.length) {
    for (let i = itineraryList.length; i < days; i++) {
      itineraryList.push(`**Day ${i + 1}: Adventure & Custom Path**\nEmbark on a customized local tour, try regional delicacies, and connect with fellow Voya matched travelers.`);
    }
  } else if (days < itineraryList.length) {
    itineraryList.length = days;
  }

  return {
    destination,
    days,
    budgetTier,
    matchedTierData,
    itineraryList
  };
};

const getAIChatResponse = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Chat message history is required' });
    }

    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage.content || '';

    // Enforce strict limit of 6 requests per day per traveler
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Get fresh user record from DB to ensure count is accurate
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Reset daily count if date has shifted
    if (user.lastAIQueryDate !== todayStr) {
      user.aiQueryCount = 0;
      user.lastAIQueryDate = todayStr;
    }

    const DAILY_LIMIT = 6;
    if (user.aiQueryCount >= DAILY_LIMIT) {
      return res.status(429).json({
        message: `⚠️ **Voya Co-Pilot Daily Cap Reached** ⚠️\n\nYou have consumed your **${DAILY_LIMIT} daily AI travel requests** today.\n\nTo preserve community server bandwidth, the cap resets at midnight. Check back tomorrow to map out your next dream itinerary! ✈️`
      });
    }

    const sendSuccessResponse = async (replyText) => {
      user.aiQueryCount += 1;
      await user.save();
      return res.json({ reply: replyText });
    };

    const systemPrompt = `You are Voya, the ultimate AI Travel Co-Pilot, dynamic trip planner, and premium travel concierge. Your mission is to provide outstanding, expert-level travel advice.
    
    You must answer ALL travel-related questions with high precision and rich details. When a user asks you to plan a trip, recommend stays, or give ideas:
    1. DESTINATION IDEAS & CURATED HIGHLIGHTS: Recommend stunning travel spots, local insider secrets, best times to visit, local safety tips, and cultural etiquette.
    2. CUSTOM STAY & HOTEL RECOMMENDATIONS: Always suggest specific, real accommodations categorized into three distinct budget tiers:
       - 🎒 Budget / Backpacker (Premium hostels, cozy homestays, or unique local stays with estimated prices in local currency / USD)
       - 🏨 Mid-Range / Boutique (Design-focused boutique hotels or artistic guesthouses with estimated prices)
       - 💎 Luxury / Premium (World-class resorts, 5-star properties, or historic villa estates with estimated prices)
       Provide estimated price tags and a vivid description of what makes each stay unique.
    3. COST & DAILY BUDGET BREAKDOWNS: Share an estimated daily cost breakdown covering food/dining, local taxis/transit, and guided tours/sightseeing.
    4. IMMERSIVE DAY-BY-DAY ITINERARIES: Build structured, step-by-step itineraries featuring morning, afternoon, and evening action plans, scenic photo spots, and recommended local eateries.
    5. GENERAL TRAVEL ANSWERS: Answer any questions about flight tips, packing checklists, visa requirements, currency exchanges, local transit guides, and seasonal weather patterns.
    
    Formatting & Style Instructions:
    - Use a professional, warm, encouraging, and adventurous tone with relevant travel emojis to make the guide lively and exciting.
    - Format everything with clean, premium Markdown (tables, bullet points, clear bold headings, and horizontal rules) for exceptional contrast and comfortable screen reading.
    - Always end your response with an engaging, friendly question to refine their trip planning.`;

    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
    const hasGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '';

    // Helper to query Gemini LLM
    const queryGemini = async () => {
      console.log('[AI] Querying Google Gemini...');
      const cleanedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(msg.content || '') }]
      }));

      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      const errors = [];

      for (const model of modelsToTry) {
        try {
          console.log(`[AI] Attempting Gemini model: ${model}`);
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: cleanedMessages,
              generationConfig: { temperature: 0.7 }
            })
          });

          if (response.ok) {
            const geminiData = await response.json();
            if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
              console.log(`[AI] Gemini Success with model: ${model}`);
              return geminiData.candidates[0].content.parts[0].text;
            }
          }
          
          const errData = await response.json().catch(() => ({}));
          console.error(`[AI] Gemini model ${model} failed:`, errData);
          const msg = errData.error?.message || `HTTP ${response.status}`;
          errors.push(`${model}: ${msg}`);
        } catch (err) {
          console.error(`[AI] Exception with Gemini model ${model}:`, err);
          errors.push(`${model}: ${err.message}`);
        }
      }

      throw new Error(`All Gemini models failed. Details:\n- ${errors.join('\n- ')}`);
    };

    // 1. Try OpenAI if configured
    if (hasOpenAI) {
      console.log('[AI] Querying OpenAI GPT-4o-mini...');
      try {
        const cleanedMessages = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: String(msg.content || '')
        }));

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...cleanedMessages
            ],
            temperature: 0.7
          })
        });

        if (openaiResponse.ok) {
          const aiData = await openaiResponse.json();
          const reply = aiData.choices[0].message.content;
          return sendSuccessResponse(reply);
        } else {
          const errData = await openaiResponse.json().catch(() => ({}));
          console.error('[AI] OpenAI error response:', errData);
          
          if (hasGemini) {
            console.log('[AI] OpenAI key failed. Hot-swapping to free Gemini API...');
            try {
              const reply = await queryGemini();
              return sendSuccessResponse(reply);
            } catch (geminiErr) {
              console.error('[AI] Hot-swap Gemini also failed:', geminiErr);
            }
          }

          let errorMessage = 'I encountered an error querying the OpenAI service. ';
          if (openaiResponse.status === 401) {
            errorMessage += 'The configured OpenAI key is invalid or unauthorized.';
          } else if (openaiResponse.status === 429) {
            errorMessage += 'Your OpenAI account has hit a rate limit or has run out of credit/quota.';
          } else {
            errorMessage += `Error details: ${errData.error?.message || 'Unknown OpenAI Service error'}`;
          }

          console.log('[AI] Active LLMs failed. Generating High-Fidelity Local Simulator response...');
          const fallback = generateFallbackReply(userText);
          const reply = `
⚠️ **Voya AI Co-Pilot Rate Limit Notice** ⚠️

${errorMessage}
**System has successfully fallen back to Voya's High-Fidelity Local Travel Simulator!**

---

### 🗺️ Your Personalized Voya Itinerary: **${fallback.destination}**
*Duration: **${fallback.days} ${fallback.days === 1 ? 'Day' : 'Days'} ✈️***
*Budget Tier: **${fallback.budgetTier === 'budget' ? 'Backpacker / Budget 🎒' : fallback.budgetTier === 'luxury' ? 'Luxury / Premium 💎' : 'Mid-Range / Boutique 🏨'}***

---

#### 🏨 Top Budget-Matched Hotels:
${fallback.matchedTierData.hotels.map(h => `* **${h.name}** (${h.price})\n  _${h.desc}_`).join('\n\n')}

---

#### 📍 Suggested Itinerary:
${fallback.itineraryList.map((item, idx) => `##### Day ${idx + 1}\n${item}`).join('\n\n')}

---

#### 💡 Local Co-Pilot Travel Tip:
* **Things to Do**: ${fallback.matchedTierData.activities}
* **Voya Direct Match tip**: Group travel is up to 30% cheaper! Swipe inside Voya to match with fellow travelers heading to **${fallback.destination}** to share hotel and transfer costs!

_Would you like me to customize any day, adjust the budget tier, or suggest gourmet dining locations in ${fallback.destination}?_
          `.trim();
          return sendSuccessResponse(reply);
        }
      } catch (err) {
        console.error('[AI] OpenAI exception, trying hot-swap Gemini if available:', err);
        if (hasGemini) {
          try {
            const reply = await queryGemini();
            return sendSuccessResponse(reply);
          } catch (geminiErr) {
            console.error('[AI] Hot-swap Gemini failed:', geminiErr);
          }
        }
        
        console.log('[AI] Active LLMs failed on exception. Generating High-Fidelity Local Simulator response...');
        const fallback = generateFallbackReply(userText);
        const reply = `
⚠️ **Voya AI Co-Pilot Rate Limit Notice** ⚠️

${err.message || 'I encountered an exception querying the OpenAI service.'}
**System has successfully fallen back to Voya's High-Fidelity Local Travel Simulator!**

---

### 🗺️ Your Personalized Voya Itinerary: **${fallback.destination}**
*Duration: **${fallback.days} ${fallback.days === 1 ? 'Day' : 'Days'} ✈️***
*Budget Tier: **${fallback.budgetTier === 'budget' ? 'Backpacker / Budget 🎒' : fallback.budgetTier === 'luxury' ? 'Luxury / Premium 💎' : 'Mid-Range / Boutique 🏨'}***

---

#### 🏨 Top Budget-Matched Hotels:
${fallback.matchedTierData.hotels.map(h => `* **${h.name}** (${h.price})\n  _${h.desc}_`).join('\n\n')}

---

#### 📍 Suggested Itinerary:
${fallback.itineraryList.map((item, idx) => `##### Day ${idx + 1}\n${item}`).join('\n\n')}

---

#### 💡 Local Co-Pilot Travel Tip:
* **Things to Do**: ${fallback.matchedTierData.activities}
* **Voya Direct Match tip**: Group travel is up to 30% cheaper! Swipe inside Voya to match with fellow travelers heading to **${fallback.destination}** to share hotel and transfer costs!

_Would you like me to customize any day, adjust the budget tier, or suggest gourmet dining locations in ${fallback.destination}?_
        `.trim();
        return sendSuccessResponse(reply);
      }
    }
    // 2. Otherwise, Try Gemini directly if configured
    else if (hasGemini) {
      try {
        const reply = await queryGemini();
        return sendSuccessResponse(reply);
      } catch (err) {
        console.error('[AI] Gemini fetch failed, generating High-Fidelity Local Simulator response:', err);
        const fallback = generateFallbackReply(userText);
        const reply = `
⚠️ **Voya AI Co-Pilot Rate Limit Notice (Gemini)** ⚠️

${err.message || 'I encountered an error querying the Gemini service.'}
**System has successfully fallen back to Voya's High-Fidelity Local Travel Simulator!**

---

### 🗺️ Your Personalized Voya Itinerary: **${fallback.destination}**
*Duration: **${fallback.days} ${fallback.days === 1 ? 'Day' : 'Days'} ✈️***
*Budget Tier: **${fallback.budgetTier === 'budget' ? 'Backpacker / Budget 🎒' : fallback.budgetTier === 'luxury' ? 'Luxury / Premium 💎' : 'Mid-Range / Boutique 🏨'}***

---

#### 🏨 Top Budget-Matched Hotels:
${fallback.matchedTierData.hotels.map(h => `* **${h.name}** (${h.price})\n  _${h.desc}_`).join('\n\n')}

---

#### 📍 Suggested Itinerary:
${fallback.itineraryList.map((item, idx) => `##### Day ${idx + 1}\n${item}`).join('\n\n')}

---

#### 💡 Local Co-Pilot Travel Tip:
* **Things to Do**: ${fallback.matchedTierData.activities}
* **Voya Direct Match tip**: Group travel is up to 30% cheaper! Swipe inside Voya to match with fellow travelers heading to **${fallback.destination}** to share hotel and transfer costs!

_Would you like me to customize any day, adjust the budget tier, or suggest gourmet dining locations in ${fallback.destination}?_
        `.trim();
        return sendSuccessResponse(reply);
      }
    }

    // 3. High-Fidelity Fallback Travel Simulator Engine (If no keys configured at all)
    console.log('[AI] Using fallback travel simulator engine...');
    const fallback = generateFallbackReply(userText);
    const reply = `
### 🗺️ Your Personalized Voya Itinerary: **${fallback.destination}**
*Duration: **${fallback.days} ${fallback.days === 1 ? 'Day' : 'Days'} ✈️***
*Budget Tier: **${fallback.budgetTier === 'budget' ? 'Backpacker / Budget 🎒' : fallback.budgetTier === 'luxury' ? 'Luxury / Premium 💎' : 'Mid-Range / Boutique 🏨'}***

---

#### 🏨 Top Budget-Matched Hotels:
${fallback.matchedTierData.hotels.map(h => `* **${h.name}** (${h.price})\n  _${h.desc}_`).join('\n\n')}

---

#### 📍 Suggested Itinerary:
${fallback.itineraryList.map((item, idx) => `##### Day ${idx + 1}\n${item}`).join('\n\n')}

---

#### 💡 Local Co-Pilot Travel Tip:
* **Things to Do**: ${fallback.matchedTierData.activities}
* **Voya Direct Match tip**: Group travel is up to 30% cheaper! Swipe inside Voya to match with fellow travelers heading to **${fallback.destination}** to share hotel and transfer costs!

_Would you like me to customize any day, adjust the budget tier, or suggest gourmet dining locations in ${fallback.destination}?_
    `.trim();

    return sendSuccessResponse(reply);
  } catch (error) {
    console.error('AI Controller Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAIChatResponse
};
