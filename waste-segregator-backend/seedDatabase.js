// seedDatabase.js
require('dotenv').config();
const mongoose = require('mongoose');
const Bin = require('./src/models/Bin');

const sampleBins = [
  {
    binId: 'BIN-001',
    category: 'metal',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Main St, New York, NY'
    },
    status: 'active',
    fillLevel: 75,
    capacity: 100,
    lastEmptied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    installationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    maintenanceSchedule: {
      frequency: 'monthly',
      lastMaintenanceDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      nextMaintenanceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    images: [
      {
        url: 'https://th.bing.com/th/id/OIP.GjmfozOD7MYZHJnRMiJ8ZAHaE7?w=255&h=180&c=7&r=0&o=7&cb=ucfimg2&pid=1.7&rm=3&ucfimg=1',
        public_id: 'metal_bin_001',
        caption: 'Metal waste bin',
        uploadedAt: new Date()
      }
    ]
  },
  {
    binId: 'BIN-002',
    category: 'biodegradable',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '456 Oak Ave, New York, NY'
    },
    status: 'active',
    fillLevel: 45,
    capacity: 100,
    lastEmptied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    installationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    maintenanceSchedule: {
      frequency: 'weekly',
      lastMaintenanceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextMaintenanceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    images: [
      {
        url: 'https://th.bing.com/th/id/OIP.wCfjWbpzr3SNn3iTGuHANwHaEJ?w=293&h=180&c=7&r=0&o=7&cb=ucfimg2&pid=1.7&rm=3&ucfimg=1',
        public_id: 'biodegradable_bin_002',
        caption: 'Biodegradable waste bin',
        uploadedAt: new Date()
      }
    ]
  },
  {
    binId: 'BIN-003',
    category: 'non-biodegradable',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '789 Pine St, New York, NY'
    },
    status: 'active',
    fillLevel: 85,
    capacity: 100,
    lastEmptied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    installationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    maintenanceSchedule: {
      frequency: 'biweekly',
      lastMaintenanceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      nextMaintenanceDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    },
    images: [
      {
        url: 'https://th.bing.com/th/id/OIP.X776fJ0xEzTc53Ic0QH3AwHaGD?w=191&h=180&c=7&r=0&o=7&cb=ucfimg2&pid=1.7&rm=3&ucfimg=1',
        public_id: 'non_biodegradable_bin_003',
        caption: 'Non-biodegradable waste bin with plastic bottles and wrappers',
        uploadedAt: new Date()
      }
    ]
  },
  {
    binId: 'BIN-004',
    category: 'others',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '321 Elm St, New York, NY'
    },
    status: 'active',
    fillLevel: 55,
    capacity: 100,
    lastEmptied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    installationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    maintenanceSchedule: {
      frequency: 'biweekly',
      lastMaintenanceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextMaintenanceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
        public_id: 'others_bin_004',
        caption: 'Others waste bin',
        uploadedAt: new Date()
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Bin.deleteMany({});
    console.log('🧹 Cleared existing bins');

    const createdBins = await Bin.insertMany(sampleBins);
    console.log(`🌱 Seeded ${createdBins.length} bins successfully`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
