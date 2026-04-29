import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const ticketService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/tickets?${params}`);
  },
  
  getById: (id) => {
    return api.get(`/tickets/${id}`);
  },
  
  create: (ticketData) => {
    return api.post('/tickets', ticketData);
  },
  
  assign: (id, agentId) => {
    return api.put(`/tickets/${id}/assign`, { agent_id: agentId });
  },
  
  updateStatus: (id, status, agentId) => {
    return api.put(`/tickets/${id}/status`, { status, agent_id: agentId });
  },
  
  addNote: (id, agentId, content) => {
    return api.post(`/tickets/${id}/notes`, { agent_id: agentId, content });
  },
  
  addSurvey: (id, rating, verbatim) => {
    return api.post(`/tickets/${id}/survey`, { rating, verbatim });
  },
  
  getStats: () => {
    return api.get('/tickets/stats');
  }
};

export default api;