const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur connexion BDD:', err);
  } else {
    console.log('✅ Connecté à la base de données SQLite');
  }
});

db.serialize(() => {
  
  // ==========================================
  // TABLE 1 : CUSTOMERS
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // ==========================================
  // TABLE 2 : TEAMS
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // ==========================================
  // TABLE 3 : AGENTS
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      team_id INTEGER,
      status TEXT DEFAULT 'Available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);
  
  // ==========================================
  // TABLE 4 : TICKETS (VERSION COMPLÈTE)
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT UNIQUE NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'Normal',
      status TEXT DEFAULT 'New',
      channel TEXT DEFAULT 'Web',
      sentiment_score REAL,
      customer_id INTEGER,
      agent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sla_deadline DATETIME,
      resolved_at DATETIME,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `);
  
  // ==========================================
  // TABLE 5 : TICKET_ACTIVITY (Historique)
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS ticket_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      actor_id INTEGER,
      description TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    )
  `);
  
  // ==========================================
  // TABLE 6 : INTERNAL_NOTE (Notes internes)
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS internal_note (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      agent_id INTEGER,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id),
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `);
  
  // ==========================================
  // TABLE 7 : ATTACHMENT (Pièces jointes)
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS attachment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    )
  `);
  
  // ==========================================
  // TABLE 8 : SATISFACTION_SURVEY (Enquêtes)
  // ==========================================
  db.run(`
    CREATE TABLE IF NOT EXISTS satisfaction_survey (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      verbatim TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    )
  `);
  
  console.log('✅ Toutes les tables créées avec succès');
  
  // ==========================================
  // DONNÉES DE TEST
  // ==========================================
  insertTestData();
});

// Fonction pour insérer des données de test
function insertTestData() {
  
  // Vérifier si des données existent déjà
  db.get('SELECT COUNT(*) as count FROM teams', (err, row) => {
    if (err || row.count > 0) return;
    
    // Insérer des équipes
    db.run(`
      INSERT INTO teams (name, description) VALUES 
      ('Technique', 'Support technique et bugs'),
      ('Facturation', 'Questions de facturation et paiement'),
      ('Produit', 'Questions sur les fonctionnalités produit')
    `);
    
    // Insérer des agents
    db.run(`
      INSERT INTO agents (name, email, team_id, status) VALUES 
      ('Thomas Martin', 'thomas@helpsolve.com', 1, 'Available'),
      ('Julie Dupont', 'julie@helpsolve.com', 2, 'Available'),
      ('Marc Bernard', 'marc@helpsolve.com', 1, 'Busy'),
      ('Sophie Leblanc', 'sophie@helpsolve.com', 3, 'Available')
    `);
    
    console.log('✅ Données de test insérées');
  });
}

module.exports = db;