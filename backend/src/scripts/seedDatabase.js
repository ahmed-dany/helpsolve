//Mongo📄 FICHIER : backend/src/scripts/seedDatabase.js

const mongoose = require('mongoose');
const Team = require('../models/schemas/TeamSchema');
const Agent = require('../models/schemas/AgentSchema');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connexion
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpsolve';
    await mongoose.connect(MONGODB_URI);//✅ CORRECTION ICI
    console.log('✅ Connecté à MongoDB');
    
    // Supprimer les données existantes
    await Team.deleteMany({});
    await Agent.deleteMany({});
    console.log('🗑️  Anciennes données supprimées');
    
    // Créer les équipes
    const teams = await Team.insertMany([
      { name: 'Technique', description: 'Support technique et bugs' },
      { name: 'Facturation', description: 'Questions de facturation et paiement' },
      { name: 'Produit', description: 'Questions sur les fonctionnalités produit' }
    ]);
    console.log('✅ 3 équipes créées');
    
    // Créer les agents
    await Agent.insertMany([
      { name: 'Thomas Martin', email: 'thomas@helpsolve.com', team: teams[0]._id, status: 'Available' },
      { name: 'Julie Dupont', email: 'julie@helpsolve.com', team: teams[1]._id, status: 'Available' },
      { name: 'Marc Bernard', email: 'marc@helpsolve.com', team: teams[0]._id, status: 'Busy' },
      { name: 'Sophie Leblanc', email: 'sophie@helpsolve.com', team: teams[2]._id, status: 'Available' }
    ]);
    console.log('✅ 4 agents créés');
    
    console.log('');
    console.log('🎉 Base de données initialisée avec succès !');
    console.log('');
    console.log('📋 Données créées :');
    console.log('   - 3 équipes (Technique, Facturation, Produit)');
    console.log('   - 4 agents (Thomas, Julie, Marc, Sophie)');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

seedDatabase();