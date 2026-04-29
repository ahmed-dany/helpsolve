//Mongo📄 FICHIER : backend/src/controllers/agentController.js

const Agent = require('../models/Agent');

// Récupérer tous les agents
async function getAllAgents(req, res) {
  try {
    const agents = await Agent.getAll();
    
    res.json({
      success: true,
      count: agents.length,
      agents: agents
    });
    
  } catch (error) {
    console.error('Erreur récupération agents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des agents',
      error: error.message
    });
  }
}

// Récupérer un agent par ID
async function getAgentById(req, res) {
  try {
    const agent = await Agent.getById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent non trouvé'
      });
    }
    
    res.json({
      success: true,
      agent: agent
    });
    
  } catch (error) {
    console.error('Erreur récupération agent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'agent',
      error: error.message
    });
  }
}

module.exports = {
  getAllAgents,
  getAgentById
};