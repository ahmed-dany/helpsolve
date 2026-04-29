//Mongo📄 FICHIER : backend/src/routes/agentRoutes.js

const express = require('express');
const router = express.Router();
const { 
  getAllAgents, 
  getAgentById 
} = require('../controllers/agentController');

router.get('/agents', getAllAgents);
router.get('/agents/:id', getAgentById);

module.exports = router;