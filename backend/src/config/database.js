// Mongo📄 FICHIER : backend/src/config/database.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpsolve';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connecté à MongoDB');
    console.log(`📦 Base de données : ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Gestion des événements
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connecté à MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose déconnecté');
});

// Fermeture propre
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 Connexion MongoDB fermée (arrêt application)');
  process.exit(0);
});

module.exports = connectDB;