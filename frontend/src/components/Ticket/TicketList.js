import React, { useState, useEffect } from 'react';
import TicketCard from './TicketCard';
import { ticketService } from '../../services/api';
import './TicketList.css';

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    priority: ''
  });
  
  useEffect(() => {
    loadTickets();
  }, [filter]);
  
  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAll(filter);
      setTickets(response.data.tickets);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Chargement des tickets...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button onClick={loadTickets}>Réessayer</button>
      </div>
    );
  }
  
  return (
    <div className="ticket-list">
      <div className="filters">
        <div className="filter-group">
          <label>Statut :</label>
          <select 
            value={filter.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Tous</option>
            <option value="New">Nouveau</option>
            <option value="Open">Ouvert</option>
            <option value="Pending">En attente</option>
            <option value="Resolved">Résolu</option>
            <option value="Closed">Fermé</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Priorité :</label>
          <select 
            value={filter.priority} 
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">Toutes</option>
            <option value="Critical">Critique</option>
            <option value="High">Haute</option>
            <option value="Normal">Normale</option>
            <option value="Low">Basse</option>
          </select>
        </div>
        
        <div className="tickets-count">
          <strong>{tickets.length}</strong> ticket{tickets.length > 1 ? 's' : ''}
        </div>
      </div>
      
      {tickets.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>Aucun ticket trouvé</h3>
          <p>Modifiez les filtres ou créez un nouveau ticket</p>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TicketList;