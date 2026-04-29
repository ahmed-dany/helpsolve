//Mongo📄 FICHIER : backend/src/models/Agent.js

const Agent = require('./schemas/AgentSchema');
const Team = require('./schemas/TeamSchema');

class AgentModel {
  
  // Récupérer tous les agents
  static async getAll() {
    try {
      const agents = await Agent.find()
        .populate('team', 'name description')
        .lean();
      
      return agents.map(agent => ({
        id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        team_id: agent.team?._id?.toString(),
        team_name: agent.team?.name,
        status: agent.status,
        created_at: agent.createdAt,
        updated_at: agent.updatedAt
      }));
      
    } catch (error) {
      console.error('Erreur récupération agents:', error);
      throw error;
    }
  }
  
  // Récupérer un agent par ID
  static async getById(id) {
    try {
      const agent = await Agent.findById(id)
        .populate('team', 'name description')
        .lean();
      
      if (!agent) return null;
      
      return {
        id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        team_id: agent.team?._id?.toString(),
        team_name: agent.team?.name,
        status: agent.status,
        created_at: agent.createdAt,
        updated_at: agent.updatedAt
      };
      
    } catch (error) {
      console.error('Erreur récupération agent:', error);
      throw error;
    }
  }
}

module.exports = AgentModel;