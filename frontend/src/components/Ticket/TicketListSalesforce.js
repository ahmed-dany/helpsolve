import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiRefreshCw,
  FiPlus,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiCircle
} from 'react-icons/fi';
import { ticketService } from '../../services/api';
import { 
  calculateTimeRemaining,
  formatDate
} from '../../utils/helpers';
import './TicketListSalesforce.css';

function TicketListSalesforce() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  
  useEffect(() => {
    loadTickets();
  }, [filterStatus, filterPriority]);
  
  const loadTickets = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterPriority) filters.priority = filterPriority;
      
      const response = await ticketService.getAll(filters);
      setTickets(response.data.tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'Critical': return <FiAlertCircle className="priority-icon critical" />;
      case 'High': return <FiAlertCircle className="priority-icon high" />;
      case 'Normal': return <FiCircle className="priority-icon normal" />;
      case 'Low': return <FiCircle className="priority-icon low" />;
      default: return <FiCircle className="priority-icon normal" />;
    }
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      'New': { label: 'Nouveau', class: 'new' },
      'Open': { label: 'Ouvert', class: 'open' },
      'Pending': { label: 'En attente', class: 'pending' },
      'Resolved': { label: 'Résolu', class: 'resolved' },
      'Closed': { label: 'Fermé', class: 'closed' }
    };
    return badges[status] || badges['New'];
  };
  
  const filteredTickets = tickets.filter(ticket => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      ticket.ticket_number.toLowerCase().includes(search) ||
      ticket.subject.toLowerCase().includes(search) ||
      ticket.customer_email.toLowerCase().includes(search)
    );
  });
  
  return (
    <div className="ticket-list-salesforce">
      {/* Header */}
      <div className="page-header-sf">
        <div className="header-left">
          <h1 className="page-title">Tickets</h1>
          <span className="item-count">{filteredTickets.length} éléments</span>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadTickets}>
            <FiRefreshCw />
            Actualiser
          </button>
          <button className="btn-primary">
            <FiPlus />
            Nouveau Ticket
          </button>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par numéro, sujet, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-sf"
            />
          </div>
        </div>
        
        <div className="toolbar-right">
          <div className="filter-group-sf">
            <FiFilter className="filter-icon" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous les statuts</option>
              <option value="New">Nouveau</option>
              <option value="Open">Ouvert</option>
              <option value="Pending">En attente</option>
              <option value="Resolved">Résolu</option>
              <option value="Closed">Fermé</option>
            </select>
          </div>
          
          <div className="filter-group-sf">
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="">Toutes les priorités</option>
              <option value="Critical">Critique</option>
              <option value="High">Haute</option>
              <option value="Normal">Normale</option>
              <option value="Low">Basse</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Table */}
      {loading ? (
        <div className="loading-sf">
          <div className="spinner-sf"></div>
          <p>Chargement des tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="empty-state-sf">
          <div className="empty-icon">📭</div>
          <h3>Aucun ticket trouvé</h3>
          <p>Modifiez vos filtres ou créez un nouveau ticket</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table-sf">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Sujet</th>
                <th>Client</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Agent</th>
                <th>SLA</th>
                <th>Créé le</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => {
                const slaInfo = calculateTimeRemaining(ticket.sla_deadline);
                const statusBadge = getStatusBadge(ticket.status);
                
                return (
                  <tr 
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="table-row"
                  >
                    <td className="ticket-number-cell">
                      {getPriorityIcon(ticket.priority)}
                      <span className="ticket-number-link">
                        {ticket.ticket_number}
                      </span>
                    </td>
                    
                    <td className="subject-cell">
                      <div className="subject-text">{ticket.subject}</div>
                    </td>
                    
                    <td className="customer-cell">
                      <div className="customer-name">
                        {ticket.customer_name || 'N/A'}
                      </div>
                      <div className="customer-email">
                        {ticket.customer_email}
                      </div>
                    </td>
                    
                    <td>
                      <span className={`priority-label ${ticket.priority.toLowerCase()}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    
                    <td>
                      <span className={`status-badge-sf ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    
                    <td className="agent-cell">
                      {ticket.agent_name ? (
                        <div className="agent-info">
                          <div className="agent-avatar-sm">
                            {ticket.agent_name.charAt(0)}
                          </div>
                          <span>{ticket.agent_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted">Non assigné</span>
                      )}
                    </td>
                    
                    <td>
                      <div 
                        className="sla-indicator"
                        style={{ color: slaInfo.color }}
                      >
                        <FiClock />
                        <span>{slaInfo.text}</span>
                      </div>
                    </td>
                    
                    <td className="date-cell">
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TicketListSalesforce;