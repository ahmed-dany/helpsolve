//Mongo FICHIER : backend/src/models/Ticket.js

const mongoose = require('mongoose');
const Ticket = require('./schemas/TicketSchema');
const Customer = require('./schemas/CustomerSchema');
const Agent = require('./schemas/AgentSchema');
const TicketActivity = require('./schemas/TicketActivitySchema');
const InternalNote = require('./schemas/InternalNoteSchema');
const SatisfactionSurvey = require('./schemas/SatisfactionSurveySchema');

class TicketModel {
  
  // ==========================================
  // GÉNÉRER UN NUMÉRO DE TICKET UNIQUE
  // ==========================================
  static generateTicketNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `TK-${year}-${random}`;
  }
  
  // ==========================================
  // CALCULER LE SLA SELON LA PRIORITÉ
  // ==========================================
  static calculateSLA(priority) {
    const now = new Date();
    const hours = {
      'Critical': 1,
      'High': 2,
      'Normal': 8,
      'Low': 24
    };
    
    const hoursToAdd = hours[priority] || 8;
    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }
  
  // ==========================================
  // CRÉER UN TICKET
  // ==========================================
  static async create(ticketData) {
    try {
      const { 
        subject, 
        description, 
        customer_email, 
        customer_name,
        priority, 
        channel,
        sentiment_score 
      } = ticketData;
      
      // 1. Trouver ou créer le client
      let customer = await Customer.findOne({ email: customer_email.toLowerCase() });
      
      if (!customer) {
        customer = await Customer.create({
          email: customer_email.toLowerCase(),
          name: customer_name || `Client ${customer_email}`
        });
      }
      
      // 2. Générer numéro de ticket unique
      let ticketNumber;
      let isUnique = false;
      
      while (!isUnique) {
        ticketNumber = this.generateTicketNumber();
        const existing = await Ticket.findOne({ ticket_number: ticketNumber });
        if (!existing) isUnique = true;
      }
      
      // 3. Calculer SLA
      const slaDeadline = this.calculateSLA(priority || 'Normal');
      
      // 4. Créer le ticket
      const ticket = await Ticket.create({
        ticket_number: ticketNumber,
        subject,
        description,
        priority: priority || 'Normal',
        channel: channel || 'Email',
        sentiment_score,
        customer: customer._id,
        sla_deadline: slaDeadline
      });
      
      // 5. Créer l'activité "created"
      await TicketActivity.create({
        ticket: ticket._id,
        action_type: 'created',
        description: `Ticket créé via ${channel || 'Email'}`
      });
      
      // 6. Récupérer le ticket avec les infos du client
      const populatedTicket = await Ticket.findById(ticket._id)
        .populate('customer', 'email name phone')
        .lean();
      
      // Mapper au format attendu par le frontend
      return {
        id: populatedTicket._id.toString(),
        ticket_number: populatedTicket.ticket_number,
        subject: populatedTicket.subject,
        description: populatedTicket.description,
        priority: populatedTicket.priority,
        status: populatedTicket.status,
        channel: populatedTicket.channel,
        sentiment_score: populatedTicket.sentiment_score,
        customer_id: populatedTicket.customer._id.toString(),
        customer_email: populatedTicket.customer.email,
        customer_name: populatedTicket.customer.name,
        customer_phone: populatedTicket.customer.phone,
        created_at: populatedTicket.createdAt,
        updated_at: populatedTicket.updatedAt,
        sla_deadline: populatedTicket.sla_deadline
      };
      
    } catch (error) {
      console.error('Erreur création ticket:', error);
      throw error;
    }
  }
  
  // ==========================================
  // RÉCUPÉRER TOUS LES TICKETS
  // ==========================================
  static async getAll(filters = {}) {
    try {
      const query = {};
      
      // Appliquer les filtres
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.agent_id) query.agent = filters.agent_id;
      
      const tickets = await Ticket.find(query)
        .populate('customer', 'email name phone')
        .populate('agent', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      
      // Tri personnalisé par priorité
      const priorityOrder = { 'Critical': 1, 'High': 2, 'Normal': 3, 'Low': 4 };
      tickets.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      // Mapper pour correspondre à l'ancien format
      return tickets.map(ticket => ({
        id: ticket._id.toString(),
        ticket_number: ticket.ticket_number,
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        channel: ticket.channel,
        sentiment_score: ticket.sentiment_score,
        customer_id: ticket.customer?._id?.toString(),
        customer_email: ticket.customer?.email,
        customer_name: ticket.customer?.name,
        customer_phone: ticket.customer?.phone,
        agent_id: ticket.agent?._id?.toString(),
        agent_name: ticket.agent?.name,
        agent_email: ticket.agent?.email,
        created_at: ticket.createdAt,
        updated_at: ticket.updatedAt,
        sla_deadline: ticket.sla_deadline,
        resolved_at: ticket.resolved_at
      }));
      
    } catch (error) {
      console.error('Erreur récupération tickets:', error);
      throw error;
    }
  }
  
  // ==========================================
  // RÉCUPÉRER UN TICKET PAR ID
  // ==========================================
  static async getById(id) {
    try {
      const ticket = await Ticket.findById(id)
        .populate('customer', 'email name phone')
        .populate('agent', 'name email')
        .lean();
      
      if (!ticket) return null;
      
      // Récupérer les activités
      const activities = await TicketActivity.find({ ticket: id })
        .populate('actor', 'name email')
        .sort({ timestamp: -1 })
        .lean();
      
      // Récupérer les notes internes
      const notes = await InternalNote.find({ ticket: id })
        .populate('agent', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      
      // Mapper au format attendu
      return {
        id: ticket._id.toString(),
        ticket_number: ticket.ticket_number,
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        channel: ticket.channel,
        sentiment_score: ticket.sentiment_score,
        customer_id: ticket.customer?._id?.toString(),
        customer_email: ticket.customer?.email,
        customer_name: ticket.customer?.name,
        customer_phone: ticket.customer?.phone,
        agent_id: ticket.agent?._id?.toString(),
        agent_name: ticket.agent?.name,
        agent_email: ticket.agent?.email,
        created_at: ticket.createdAt,
        updated_at: ticket.updatedAt,
        sla_deadline: ticket.sla_deadline,
        resolved_at: ticket.resolved_at,
        activities: activities.map(a => ({
          id: a._id.toString(),
          ticket_id: a.ticket.toString(),
          action_type: a.action_type,
          actor_id: a.actor?._id?.toString(),
          description: a.description,
          timestamp: a.timestamp
        })),
        notes: notes.map(n => ({
          id: n._id.toString(),
          ticket_id: n.ticket.toString(),
          agent_id: n.agent?._id?.toString(),
          agent_name: n.agent?.name,
          content: n.content,
          created_at: n.createdAt
        }))
      };
      
    } catch (error) {
      console.error('Erreur récupération ticket:', error);
      throw error;
    }
  }
  
  // ==========================================
  // ASSIGNER UN TICKET À UN AGENT
  // ==========================================
  static async assign(ticketId, agentId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        throw new Error('ID de ticket invalide');
      }

      if (!mongoose.Types.ObjectId.isValid(agentId)) {
        throw new Error('ID agent invalide');
      }

      const ticket = await Ticket.findByIdAndUpdate(
        ticketId,
        { 
          agent: agentId,
          status: 'Open'
        },
        { new: true }
      );

      if (!ticket) {
        return null;
      }

      await TicketActivity.create({
        ticket: ticketId,
        action_type: 'assigned',
        actor: agentId,
        description: 'Ticket assigné à l\'agent'
      });

      return { success: true, changes: 1 };

    } catch (error) {
      console.error('Erreur assignation:', error);
      throw error;
    }
  }
  
  // ==========================================
  // CHANGER LE STATUT
  // ==========================================
  static async updateStatus(ticketId, newStatus, agentId = null) {
    try {
      const updateData = { status: newStatus };
      
      if (newStatus === 'Resolved' || newStatus === 'Closed') {
        updateData.resolved_at = new Date();
      }
      
      const ticket = await Ticket.findByIdAndUpdate(
        ticketId,
        updateData,
        { new: true, returnDocument: 'after' }
      );
      
      /*if (!ticket) {
        throw new Error('Ticket non trouvé');
      }*/
      if (!ticket) {
        return null;
      }
      // Créer l'activité
      await TicketActivity.create({
        ticket: ticketId,
        action_type: 'status_changed',
        actor: agentId,
        description: `Statut changé en ${newStatus}`
      });
      
      return { success: true, changes: 1 };
      
    } catch (error) {
      console.error('Erreur changement statut:', error);
      throw error;
    }
  }
  
  // ==========================================
  // AJOUTER UNE NOTE INTERNE
  // ==========================================
  static async addInternalNote(ticketId, agentId, content) {
    try {
      const note = await InternalNote.create({
        ticket: ticketId,
        agent: agentId,
        content
      });
      
      // Créer l'activité
      await TicketActivity.create({
        ticket: ticketId,
        action_type: 'note_added',
        actor: agentId,
        description: 'Note interne ajoutée'
      });
      
      return { success: true, id: note._id.toString() };
      
    } catch (error) {
      console.error('Erreur ajout note:', error);
      throw error;
    }
  }
  
  // ==========================================
  // AJOUTER UNE ENQUÊTE DE SATISFACTION
  // ==========================================
  static async addSatisfactionSurvey(ticketId, rating, verbatim = null) {
    try {
      const survey = await SatisfactionSurvey.create({
        ticket: ticketId,
        rating,
        verbatim
      });
      
      return { success: true, id: survey._id.toString() };
      
    } catch (error) {
      console.error('Erreur enquête:', error);
      throw error;
    }
  }
  
  // ==========================================
  // STATISTIQUES
  // ==========================================
  static async getStats() {
    try {
      // Total
      const total = await Ticket.countDocuments();
      
      // Par statut
      const byStatus = await Ticket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // Par priorité
      const byPriority = await Ticket.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]);
      
      // Satisfaction moyenne
      const satisfactionResult = await SatisfactionSurvey.aggregate([
        { $group: { _id: null, avg_rating: { $avg: '$rating' } } }
      ]);
      
      return {
        total,
        by_status: byStatus.map(s => ({ status: s._id, count: s.count })),
        by_priority: byPriority.map(p => ({ priority: p._id, count: p.count })),
        avg_satisfaction: satisfactionResult[0]?.avg_rating || null
      };
      
    } catch (error) {
      console.error('Erreur stats:', error);
      throw error;
    }
  }
}

module.exports = TicketModel;