const mongoose = require('mongoose');//nouveau
const Ticket = require('../models/Ticket');

// Créer un ticket
async function createTicket(req, res) {
  try {
    const ticket = await Ticket.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Ticket créé avec succès',
      ticket: ticket
    });
    
  } catch (error) {
    console.error('Erreur création ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du ticket',
      error: error.message
    });
  }
}

// Récupérer tous les tickets (avec filtres optionnels)
async function getAllTickets(req, res) {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      agent_id: req.query.agent_id
    };
    
    const tickets = await Ticket.getAll(filters);
    
    res.json({
      success: true,
      count: tickets.length,
      tickets: tickets
    });
    
  } catch (error) {
    console.error('Erreur récupération tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tickets',
      error: error.message
    });
  }
}

// Récupérer un ticket par ID
async function getTicketById(req, res) {
  try {
    const ticket = await Ticket.getById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }
    
    res.json({
      success: true,
      ticket: ticket
    });
    
  } catch (error) {
    console.error('Erreur récupération ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du ticket',
      error: error.message
    });
  }
}

// Assigner un ticket à un agent
/*async function assignTicket(req, res) {
  try {
    const { agent_id } = req.body;
    const result = await Ticket.assign(req.params.id, agent_id);
    
    res.json({
      success: true,
      message: 'Ticket assigné avec succès',
      result: result
    });
    
  } catch (error) {
    console.error('Erreur assignation ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'assignation',
      error: error.message
    });
  }
}*/
async function assignTicket(req, res) {
  try {
    const { agent_id } = req.body;
    const ticketId = req.params.id;

    // 🔴 Validation
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "ID de ticket invalide"
      });
    }

    if (!agent_id || !mongoose.Types.ObjectId.isValid(agent_id)) {
      return res.status(400).json({
        success: false,
        message: "ID d'agent invalide"
      });
    }

    const result = await Ticket.assign(ticketId, agent_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Ticket non trouvé"
      });
    }

    res.json({
      success: true,
      message: 'Ticket assigné avec succès',
      result: result
    });

  } catch (error) {
    console.error('Erreur assignation ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'assignation',
      error: error.message
    });
  }
}

// Changer le statut d'un ticket
/*async function updateTicketStatus(req, res) {
  try {
    const { status, agent_id } = req.body;
    const result = await Ticket.updateStatus(req.params.id, status, agent_id);
    
    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      result: result
    });
    
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
}*/
async function updateTicketStatus(req, res) {
  try {
    const { status, agent_id } = req.body;
    const ticketId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "ID de ticket invalide"
      });
    }

    const result = await Ticket.updateStatus(ticketId, status, agent_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Ticket non trouvé"
      });
    }

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      result: result
    });

  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
}

// Ajouter une note interne
async function addNote(req, res) {
  try {
    const { agent_id, content } = req.body;
    const result = await Ticket.addInternalNote(req.params.id, agent_id, content);
    
    res.status(201).json({
      success: true,
      message: 'Note ajoutée avec succès',
      result: result
    });
    
  } catch (error) {
    console.error('Erreur ajout note:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la note',
      error: error.message
    });
  }
}

// Ajouter une enquête de satisfaction
async function addSurvey(req, res) {
  try {
    const { rating, verbatim } = req.body;
    const result = await Ticket.addSatisfactionSurvey(req.params.id, rating, verbatim);
    
    res.status(201).json({
      success: true,
      message: 'Enquête enregistrée avec succès',
      result: result
    });
    
  } catch (error) {
    console.error('Erreur enquête:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de l\'enquête',
      error: error.message
    });
  }
}

// Récupérer les statistiques
async function getStats(req, res) {
  try {
    const stats = await Ticket.getStats();
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('Erreur statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
}

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  assignTicket,
  updateTicketStatus,
  addNote,
  addSurvey,
  getStats
};