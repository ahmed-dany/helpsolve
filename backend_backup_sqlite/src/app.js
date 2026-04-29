const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialiser la base de données
const db = require('./config/database');

// Importer les routes
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors()); // Autoriser les requêtes cross-origin
app.use(express.json()); // Parser le JSON dans les requêtes

// ==========================================
// ROUTES
// ==========================================

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'HELP-SOLVE API est opérationnelle',
    timestamp: new Date().toISOString()
  });
});

// Routes tickets
app.use('/api', ticketRoutes);

// Route 404 (si aucune route ne correspond)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// ==========================================
// DÉMARRER LE SERVEUR
// ==========================================
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🚀 HELP-SOLVE API DÉMARRÉE          ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`📡 Serveur : http://localhost:${PORT}`);
  console.log(`🏥 Health  : http://localhost:${PORT}/api/health`);
  console.log(`🎫 Tickets : http://localhost:${PORT}/api/tickets`);
  console.log('');
  console.log('📝 Routes disponibles :');
  console.log('   POST   /api/tickets              - Créer un ticket');
  console.log('   GET    /api/tickets              - Liste des tickets');
  console.log('   GET    /api/tickets/:id          - Détail d\'un ticket');
  console.log('   GET    /api/tickets/stats        - Statistiques');
  console.log('   PUT    /api/tickets/:id/assign   - Assigner un ticket');
  console.log('   PUT    /api/tickets/:id/status   - Changer le statut');
  console.log('   POST   /api/tickets/:id/notes    - Ajouter une note');
  console.log('   POST   /api/tickets/:id/survey   - Ajouter une enquête');
  console.log('');
  console.log('✅ Prêt à recevoir des requêtes !');
});