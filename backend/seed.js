const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const mockTravelers = [
  {
    email: 'traveler1@wandersync.com',
    password: 'password123',
    name: 'Emily Watson',
    age: 26,
    gender: 'women',
    occupation: 'Wildlife Photographer',
    bio: 'Looking for someone to explore remote hiking trails. I spend 80% of my time in mountain huts or camping under the stars. Lets catch a sunrise!',
    pictures: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551632879-c2474c1ae6e7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
    ],
    destinations: ['Reykjavik Iceland', 'Interlaken Switzerland', 'Patagonia Chile'],
    travelCalendar: 'Summer 2026',
    travelDuration: '2-4 weeks',
    travelStyles: ['Adventure', 'Nature', 'Budget'],
    prompts: [
      {
        question: 'Most adventurous thing I\'ve done...',
        answer: 'Solo trekked across the Icelandic Highlands in a major winter storm! Worth the frostbite.'
      },
      {
        question: 'My perfect travel day looks like...',
        answer: 'Waking up at 4 AM, drinking black coffee, and shooting wild puffins on a high ocean cliff.'
      },
      {
        question: 'I\'m looking for a travel partner who...',
        answer: 'Doesn\'t mind freezing temperatures, heavy backpacks, and zero phone signal.'
      }
    ],
    voicePrompt: {
      question: 'My travel vibe in three words...',
      audio: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA'
    }
  },
  {
    email: 'traveler2@wandersync.com',
    password: 'password123',
    name: 'Marcus Vance',
    age: 29,
    gender: 'men',
    occupation: 'Culinary Journalist',
    bio: 'Traveling the world one plate at a time. I plan my entire trip based on food market locations. Street food enthusiast.',
    pictures: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
    ],
    destinations: ['Kyoto Japan', 'Rome Italy', 'Bangkok Thailand'],
    travelCalendar: 'Autumn 2026',
    travelDuration: '1-2 weeks',
    travelStyles: ['Foodie', 'Cultural', 'Luxury'],
    prompts: [
      {
        question: 'A destination that completely changed me...',
        answer: 'Oaxaca, Mexico. The mole sauces and community markets opened my eyes to ancestral cuisines.'
      },
      {
        question: 'Worst travel experience that made me laugh...',
        answer: 'Eating a ghost pepper in Thailand by accident. I was crying in a public fountain for an hour!'
      },
      {
        question: 'My golden rule of traveling is...',
        answer: 'Always eat where the locals are standing in a long line, no matter what it looks like!'
      }
    ],
    voicePrompt: {
      question: 'My travel vibe in three words...',
      audio: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA'
    }
  },
  {
    email: 'traveler3@wandersync.com',
    password: 'password123',
    name: 'Sofia Martinez',
    age: 24,
    gender: 'women',
    occupation: 'Surf Coach',
    bio: 'Catch waves, live slow, explore local. Down to rent a van and drive along coastlines. Sea salt hair and campfire talks.',
    pictures: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80'
    ],
    destinations: ['Bali Indonesia', 'Ericeira Portugal', 'Gold Coast Australia'],
    travelCalendar: 'Summer 2026',
    travelDuration: '1 month+',
    travelStyles: ['Nature', 'Budget', 'Adventure'],
    prompts: [
      {
        question: 'My perfect travel day looks like...',
        answer: 'Dawn patrol surf session, beach hammock nap, grilling fresh catch on drift wood fire.'
      },
      {
        question: 'I\'m looking for a travel partner who...',
        answer: 'Can handle a manual drive camper van, enjoys ocean breezes, and doesn\'t stress over plans.'
      },
      {
        question: 'My golden rule of traveling is...',
        answer: 'Leave every beach cleaner than you found it.'
      }
    ],
    voicePrompt: {
      question: 'Say hello in your native language...',
      audio: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA'
    }
  },
  {
    email: 'traveler4@wandersync.com',
    password: 'password123',
    name: 'Devin Kothari',
    age: 28,
    gender: 'men',
    occupation: 'Software Engineer & Nomad',
    bio: 'Working remotely from coffee shops. Exploring historic cities, high-speed rail, museum hops, and coding with local beer.',
    pictures: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'
    ],
    destinations: ['Tokyo Japan', 'Zurich Switzerland', 'Singapore'],
    travelCalendar: 'Winter 2026',
    travelDuration: '1 month+',
    travelStyles: ['Cultural', 'Luxury', 'Road-Trips'],
    prompts: [
      {
        question: 'A destination that completely changed me...',
        answer: 'Kyoto, Japan. The peaceful temple structures contrast with the hyper-modern bullet trains.'
      },
      {
        question: 'Worst travel experience that made me laugh...',
        answer: 'My laptop died right in the middle of a major code deployment while stranded in a Swiss gondola!'
      },
      {
        question: 'I\'m looking for a travel partner who...',
        answer: 'Is a digital nomad or enjoys exploring beautiful architectural cities and museum halls.'
      }
    ],
    voicePrompt: {
      question: 'A secret travel tip I\'m willing to share...',
      audio: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA'
    }
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wandersync');
    console.log('MongoDB Connected for seeding.');

    // Clear existing mock data
    await User.deleteMany({ email: { $in: mockTravelers.map(t => t.email) } });
    console.log('Cleared existing mock users.');

    // Insert mock users (hooks password hashing automatically)
    for (const traveler of mockTravelers) {
      await User.create(traveler);
    }

    console.log('Successfully seeded 4 premium mock traveler profiles!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
