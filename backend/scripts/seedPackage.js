const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Package = require("../models/Package");
const User = require("../models/User"); // Import User model

const packages = [
  {
    name: "Maldives Paradise Escape",
    destination: "Maldives",
    description:
      "Experience luxury and tranquility in the stunning Maldives with pristine beaches and crystal-clear waters.",
    price: 2500,
    type: "luxury",
    duration: 7,
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-06-08"),
    images: [
      "https://images.unsplash.com/photo-1544955404-7142b372971f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Check-in",
        description:
          "Arrive at Male International Airport. Transfer to your luxury resort by speedboat.",
      },
      {
        day: 2,
        title: "Beach Relaxation",
        description:
          "Enjoy your private beach villa with stunning ocean views.",
      },
      {
        day: 3,
        title: "Water Sports",
        description: "Snorkeling and diving in crystal-clear waters.",
      },
      {
        day: 4,
        title: "Island Hopping",
        description: "Visit nearby islands and local villages.",
      },
      {
        day: 5,
        title: "Spa & Wellness",
        description: "Indulge in traditional Maldivian spa treatments.",
      },
      {
        day: 6,
        title: "Sunset Cruise",
        description: "Romantic sunset dolphin cruise.",
      },
      {
        day: 7,
        title: "Departure",
        description: "Check-out and transfer to airport.",
      },
    ],
    included: [
      "Accommodation",
      "Daily breakfast",
      "Airport transfers",
      "Water sports equipment",
      "Spa treatment",
    ],
    excluded: [
      "International flights",
      "Lunch & dinner",
      "Personal expenses",
      "Travel insurance",
    ],
    maxPeople: 15,
    available: true,
    rating: 4.8,
    reviewsCount: 124,
  },
  {
    name: "Everest Base Camp Trek",
    destination: "Nepal",
    description:
      "An adventurous trek to the base of the world's highest mountain, Mount Everest.",
    price: 1800,
    type: "adventure",
    duration: 14,
    startDate: new Date("2026-07-15"),
    endDate: new Date("2026-07-29"),
    images: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1546422904-90eab23c3d7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Kathmandu",
        description: "Meet your guide and trip briefing.",
      },
      {
        day: 2,
        title: "Fly to Lukla",
        description: "Scenic flight and trek to Phakding.",
      },
      {
        day: 3,
        title: "Trek to Namche Bazaar",
        description: "Cross suspension bridges and climb to Namche.",
      },
      {
        day: 4,
        title: "Acclimatization Day",
        description: "Rest day with short hikes.",
      },
      {
        day: 5,
        title: "Trek to Tengboche",
        description: "Visit famous monastery.",
      },
    ],
    included: [
      "Trekking permits",
      "Guide & porter",
      "Accommodation",
      "Meals during trek",
      "Domestic flights",
    ],
    excluded: [
      "International flights",
      "Travel insurance",
      "Personal gear",
      "Tips",
    ],
    maxPeople: 12,
    available: true,
    rating: 4.9,
    reviewsCount: 89,
  },
  {
    name: "Bali Cultural Journey",
    destination: "Bali, Indonesia",
    description:
      "Immerse yourself in Balinese culture, temples, and traditional ceremonies.",
    price: 1200,
    type: "cultural",
    duration: 10,
    startDate: new Date("2026-08-10"),
    endDate: new Date("2026-08-20"),
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Denpasar",
        description: "Transfer to Ubud, cultural heart of Bali.",
      },
      {
        day: 2,
        title: "Temple Tour",
        description: "Visit Tanah Lot and Uluwatu temples.",
      },
      {
        day: 3,
        title: "Rice Terrace Walk",
        description: "Explore Tegalalang rice terraces.",
      },
      {
        day: 4,
        title: "Traditional Cooking Class",
        description: "Learn to cook Balinese dishes.",
      },
      {
        day: 5,
        title: "Art & Craft Villages",
        description: "Visit local artisan workshops.",
      },
    ],
    included: [
      "Hotel accommodation",
      "Daily breakfast",
      "Guided tours",
      "Entrance fees",
      "Cooking class",
    ],
    excluded: [
      "International flights",
      "Lunch & dinner",
      "Personal expenses",
      "Optional activities",
    ],
    maxPeople: 20,
    available: true,
    rating: 4.6,
    reviewsCount: 156,
  },
  {
    name: "Swiss Alps Family Adventure",
    destination: "Switzerland",
    description:
      "Perfect family vacation with mountain activities, chocolate tours, and scenic train rides.",
    price: 3200,
    type: "family",
    duration: 9,
    startDate: new Date("2026-09-05"),
    endDate: new Date("2026-09-14"),
    images: [
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c73?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1589820296156-2454bb8a6d54?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Zurich",
        description: "City tour and lake cruise.",
      },
      {
        day: 2,
        title: "Lucerne Exploration",
        description: "Chapel Bridge and Lion Monument.",
      },
      {
        day: 3,
        title: "Mount Titlis",
        description: "Cable car ride and snow activities.",
      },
      {
        day: 4,
        title: "Interlaken",
        description: "Paragliding and adventure sports.",
      },
      {
        day: 5,
        title: "Jungfraujoch",
        description: "Top of Europe train journey.",
      },
    ],
    included: [
      "Hotel accommodation",
      "Daily breakfast",
      "Swiss Travel Pass",
      "Cable car tickets",
      "Guided tours",
    ],
    excluded: [
      "International flights",
      "Lunch & dinner",
      "Travel insurance",
      "Optional activities",
    ],
    maxPeople: 25,
    available: true,
    rating: 4.7,
    reviewsCount: 98,
  },
  {
    name: "Paris Honeymoon Special",
    destination: "Paris, France",
    description:
      "Romantic getaway in the city of love with luxury accommodations and exclusive experiences.",
    price: 2800,
    type: "honeymoon",
    duration: 6,
    startDate: new Date("2026-10-01"),
    endDate: new Date("2026-10-07"),
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1550340499-a6c6088e6619?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1520939817895-060bdaf4de1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Paris",
        description: "Check-in to luxury hotel. Champagne welcome.",
      },
      {
        day: 2,
        title: "Eiffel Tower & Seine Cruise",
        description: "Private dinner cruise.",
      },
      {
        day: 3,
        title: "Louvre & Champs-Élysées",
        description: "Art and shopping.",
      },
      {
        day: 4,
        title: "Versailles Palace",
        description: "Day trip to palace and gardens.",
      },
      {
        day: 5,
        title: "Montmartre & Sacré-Cœur",
        description: "Artists' quarter exploration.",
      },
      {
        day: 6,
        title: "Departure",
        description: "Farewell breakfast and airport transfer.",
      },
    ],
    included: [
      "5-star hotel",
      "Daily breakfast",
      "Private transfers",
      "Seine dinner cruise",
      "Museum tickets",
    ],
    excluded: [
      "International flights",
      "Lunch & dinner",
      "Shopping",
      "Travel insurance",
    ],
    maxPeople: 10,
    available: true,
    rating: 5.0,
    reviewsCount: 67,
  },
  {
    name: "Thai Beach Relaxation",
    destination: "Phuket, Thailand",
    description:
      "Unwind on beautiful Thai beaches with spa treatments and island hopping.",
    price: 950,
    type: "relaxation",
    duration: 8,
    startDate: new Date("2026-11-15"),
    endDate: new Date("2026-11-23"),
    images: [
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Phuket",
        description: "Beach resort check-in.",
      },
      { day: 2, title: "Beach Day", description: "Relax on Patong Beach." },
      {
        day: 3,
        title: "Spa Day",
        description: "Traditional Thai massage and spa.",
      },
      { day: 4, title: "Phi Phi Islands", description: "Day trip by boat." },
      {
        day: 5,
        title: "Yoga & Meditation",
        description: "Beachfront wellness session.",
      },
    ],
    included: [
      "Beach resort accommodation",
      "Daily breakfast",
      "Spa treatments",
      "Island tour",
      "Yoga classes",
    ],
    excluded: [
      "International flights",
      "Lunch & dinner",
      "Personal expenses",
      "Travel insurance",
    ],
    maxPeople: 18,
    available: true,
    rating: 4.5,
    reviewsCount: 143,
  },
];

const seedDatabase = async () => {
  try {
    // Check if MONGO_URI is loaded
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in .env file");
      console.log(
        "📁 Looking for .env file at:",
        path.join(__dirname, "../.env")
      );
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find or create a default admin user for seeding
    let adminUser = await User.findOne({ email: "admin@travelagency.com" });
    
    if (!adminUser) {
      console.log("👤 Creating default admin user for seeding...");
      adminUser = await User.create({
        name: "Admin User",
        email: "admin@travelagency.com",
        password: "admin123", // Make sure this gets hashed by your User model
        role: "admin",
      });
      console.log("✅ Admin user created");
    } else {
      console.log("✅ Using existing admin user");
    }

    // Add createdBy field to all packages
    const packagesWithCreator = packages.map((pkg) => ({
      ...pkg,
      createdBy: adminUser._id,
    }));

    // Clear existing packages
    await Package.deleteMany({});
    console.log("🗑️  Cleared existing packages");

    // Insert seed data
    const result = await Package.insertMany(packagesWithCreator);
    console.log(`✅ Successfully seeded ${result.length} packages`);

    // Display seeded packages
    console.log("📦 Seeded Packages:");
    result.forEach((pkg, index) => {
      console.log(
        `${index + 1}. ${pkg.name} - ${pkg.destination} - $${pkg.price}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();