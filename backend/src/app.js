//Mongo📄 FICHIER : backend/src/app.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');

// Routes
const ticketRoutes = require('./routes/ticketRoutes');
const agentRoutes = require('./routes/agentRoutes');  // 🆕 AJOUTER CETTE LIGNE

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'HELP-SOLVE API est opérationnelle',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', ticketRoutes);
app.use('/api', agentRoutes);  // 🆕 AJOUTER CETTE LIGNE

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log('╔════════════════════════════════════════╗');
      console.log('║   🚀 HELP-SOLVE API DÉMARRÉE          ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('');
      console.log(`📡 Serveur : http://localhost:${PORT}`);
      console.log(`🏥 Health  : http://localhost:${PORT}/api/health`);
      console.log(`🎫 Tickets : http://localhost:${PORT}/api/tickets`);
      console.log(`👥 Agents  : http://localhost:${PORT}/api/agents`);  // 🆕
      console.log('');
      console.log('✅ Prêt à recevoir des requêtes !');
    });
    
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    process.exit(1);
  }
};

startServer();