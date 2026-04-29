const db = require('../config/database');

class Ticket {
  
  // ==========================================
  // GÉNÉRER UN NUMÉRO DE TICKET UNIQUE
  // ==========================================
  static generateTicketNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `TK-${year}-${random}`;
  }
  
  // ==========================================
  // CRÉER UN TICKET
  // ==========================================
  static create(ticketData) {
    return new Promise((resolve, reject) => {
      const { 
        subject, 
        description, 
        customer_email, 
        customer_name,
        priority, 
        channel,
        sentiment_score 
      } = ticketData;
      
      // Calculer le SLA selon la priorité
      const getSLADeadline = (priority) => {
        const now = new Date();
        switch(priority) {
          case 'Critical': 
            return new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1h
          case 'High': 
            return new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2h
          case 'Normal': 
            return new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8h
          case 'Low': 
            return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
          default: 
            return new Date(now.getTime() + 8 * 60 * 60 * 1000);
        }
      };
      
      // 1. Vérifier si le client existe
      db.get(
        'SELECT id FROM customers WHERE email = ?',
        [customer_email],
        (err, customer) => {
          if (err) return reject(err);
          
          const createTicket = (customerId) => {
            const ticketNumber = this.generateTicketNumber();
            const slaDeadline = getSLADeadline(priority || 'Normal');
            
            // 2. Créer le ticket
            db.run(
              `INSERT INTO tickets 
               (ticket_number, subject, description, priority, status, channel, 
                sentiment_score, customer_id, sla_deadline)
               VALUES (?, ?, ?, ?, 'New', ?, ?, ?, ?)`,
              [
                ticketNumber, 
                subject, 
                description, 
                priority || 'Normal', 
                channel || 'Web',
                sentiment_score || null,
                customerId, 
                slaDeadline.toISOString()
              ],
              function(err) {
                if (err) return reject(err);
                
                const ticketId = this.lastID;
                
                // 3. Créer une activité "Ticket créé"
                db.run(
                  `INSERT INTO ticket_activity 
                   (ticket_id, action_type, description)
                   VALUES (?, 'created', ?)`,
                  [ticketId, `Ticket créé via ${channel || 'Web'}`],
                  (err) => {
                    if (err) console.error('Erreur activité:', err);
                  }
                );
                
                // 4. Récupérer le ticket créé avec les infos du client
                db.get(
                  `SELECT t.*, 
                          c.email as customer_email, 
                          c.name as customer_name,
                          c.phone as customer_phone
                   FROM tickets t
                   LEFT JOIN customers c ON t.customer_id = c.id
                   WHERE t.id = ?`,
                  [ticketId],
                  (err, ticket) => {
                    if (err) return reject(err);
                    resolve(ticket);
                  }
                );
              }
            );
          };
          
          // Si le client existe
          if (customer) {
            createTicket(customer.id);
          } 
          // Sinon créer le client
          else {
            db.run(
              'INSERT INTO customers (email, name) VALUES (?, ?)',
              [customer_email, customer_name || 'Client ' + customer_email],
              function(err) {
                if (err) return reject(err);
                createTicket(this.lastID);
              }
            );
          }
        }
      );
    });
  }
  
  // ==========================================
  // RÉCUPÉRER TOUS LES TICKETS
  // ==========================================
  static getAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT t.*, 
               c.email as customer_email, 
               c.name as customer_name,
               a.name as agent_name,
               a.email as agent_email
        FROM tickets t
        LEFT JOIN customers c ON t.customer_id = c.id
        LEFT JOIN agents a ON t.agent_id = a.id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Filtres optionnels
      if (filters.status) {
        query += ' AND t.status = ?';
        params.push(filters.status);
      }
      
      if (filters.priority) {
        query += ' AND t.priority = ?';
        params.push(filters.priority);
      }
      
      if (filters.agent_id) {
        query += ' AND t.agent_id = ?';
        params.push(filters.agent_id);
      }
      
      // Tri par priorité puis date
      query += `
        ORDER BY 
          CASE t.priority
            WHEN 'Critical' THEN 1
            WHEN 'High' THEN 2
            WHEN 'Normal' THEN 3
            WHEN 'Low' THEN 4
          END,
          t.created_at DESC
      `;
      
      db.all(query, params, (err, tickets) => {
        if (err) return reject(err);
        resolve(tickets);
      });
    });
  }
  
  // ==========================================
  // RÉCUPÉRER UN TICKET PAR ID
  // ==========================================
  static getById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT t.*, 
              c.email as customer_email, 
              c.name as customer_name,
              c.phone as customer_phone,
              a.name as agent_name,
              a.email as agent_email
       FROM tickets t
       LEFT JOIN customers c ON t.customer_id = c.id
       LEFT JOIN agents a ON t.agent_id = a.id
       WHERE t.id = ?`,
      [id],
      (err, ticket) => {
        if (err) return reject(err);
        
        if (!ticket) {
          return resolve(null);
        }
        
        // Récupérer les activités
        db.all(
          `SELECT * FROM ticket_activity 
           WHERE ticket_id = ? 
           ORDER BY timestamp DESC`,
          [id],
          (err, activities) => {
            if (err) return reject(err);
            
            // 🆕 NOUVEAU : Récupérer aussi les notes internes
            db.all(
              `SELECT n.*, a.name as agent_name
               FROM internal_note n
               LEFT JOIN agents a ON n.agent_id = a.id
               WHERE n.ticket_id = ?
               ORDER BY n.created_at DESC`,
              [id],
              (err, notes) => {
                if (err) return reject(err);
                
                ticket.activities = activities;
                ticket.notes = notes; // 🆕 Ajouter les notes
                resolve(ticket);
              }
            );
          }
        );
      }
    );
  });
}
  
  // ==========================================
  // ASSIGNER UN TICKET À UN AGENT
  // ==========================================
  static assign(ticketId, agentId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tickets 
         SET agent_id = ?, 
             status = 'Open',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [agentId, ticketId],
        function(err) {
          if (err) return reject(err);
          
          // Créer une activité
          db.run(
            `INSERT INTO ticket_activity 
             (ticket_id, action_type, actor_id, description)
             VALUES (?, 'assigned', ?, ?)`,
            [ticketId, agentId, `Ticket assigné à l'agent`],
            (err) => {
              if (err) console.error('Erreur activité:', err);
            }
          );
          
          resolve({ success: true, changes: this.changes });
        }
      );
    });
  }
  
  // ==========================================
  // CHANGER LE STATUT D'UN TICKET
  // ==========================================
  static updateStatus(ticketId, newStatus, agentId = null) {
    return new Promise((resolve, reject) => {
      const updates = { status: newStatus };
      
      // Si résolu, mettre la date
      if (newStatus === 'Resolved' || newStatus === 'Closed') {
        updates.resolved_at = new Date().toISOString();
      }
      
      db.run(
        `UPDATE tickets 
         SET status = ?, 
             resolved_at = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newStatus, updates.resolved_at || null, ticketId],
        function(err) {
          if (err) return reject(err);
          
          // Créer une activité
          db.run(
            `INSERT INTO ticket_activity 
             (ticket_id, action_type, actor_id, description)
             VALUES (?, 'status_changed', ?, ?)`,
            [ticketId, agentId, `Statut changé en ${newStatus}`],
            (err) => {
              if (err) console.error('Erreur activité:', err);
            }
          );
          
          resolve({ success: true, changes: this.changes });
        }
      );
    });
  }
  
  // ==========================================
  // AJOUTER UNE NOTE INTERNE
  // ==========================================
  static addInternalNote(ticketId, agentId, content) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO internal_note (ticket_id, agent_id, content)
         VALUES (?, ?, ?)`,
        [ticketId, agentId, content],
        function(err) {
          if (err) return reject(err);
          
          // Créer une activité
          db.run(
            `INSERT INTO ticket_activity 
             (ticket_id, action_type, actor_id, description)
             VALUES (?, 'note_added', ?, 'Note interne ajoutée')`,
            [ticketId, agentId]
          );
          
          resolve({ success: true, id: this.lastID });
        }
      );
    });
  }
  
  // ==========================================
  // AJOUTER UNE ENQUÊTE DE SATISFACTION
  // ==========================================
  static addSatisfactionSurvey(ticketId, rating, verbatim = null) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO satisfaction_survey (ticket_id, rating, verbatim)
         VALUES (?, ?, ?)`,
        [ticketId, rating, verbatim],
        function(err) {
          if (err) return reject(err);
          
          resolve({ success: true, id: this.lastID });
        }
      );
    });
  }
  
  // ==========================================
  // STATISTIQUES (pour le dashboard)
  // ==========================================
  static getStats() {
    return new Promise((resolve, reject) => {
      const stats = {};
      
      // Total de tickets
      db.get(
        'SELECT COUNT(*) as total FROM tickets',
        (err, row) => {
          if (err) return reject(err);
          stats.total = row.total;
          
          // Tickets par statut
          db.all(
            `SELECT status, COUNT(*) as count 
             FROM tickets 
             GROUP BY status`,
            (err, rows) => {
              if (err) return reject(err);
              stats.by_status = rows;
              
              // Tickets par priorité
              db.all(
                `SELECT priority, COUNT(*) as count 
                 FROM tickets 
                 GROUP BY priority`,
                (err, rows) => {
                  if (err) return reject(err);
                  stats.by_priority = rows;
                  
                  // Satisfaction moyenne
                  db.get(
                    'SELECT AVG(rating) as avg_rating FROM satisfaction_survey',
                    (err, row) => {
                      if (err) return reject(err);
                      stats.avg_satisfaction = row.avg_rating;
                      
                      resolve(stats);
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  }
}

module.exports = Ticket;