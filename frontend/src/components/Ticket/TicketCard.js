import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TicketCard.css';
import { 
  getPriorityColor, 
  getPriorityBadge, 
  calculateTimeRemaining,
  getStatusBadge,
  formatDate
} from '../../utils/helpers';

function TicketCard({ ticket }) {
  const navigate = useNavigate();
  const slaInfo = calculateTimeRemaining(ticket.sla_deadline);
  const statusInfo = getStatusBadge(ticket.status);
  
  const handleClick = () => {
    navigate(`/tickets/${ticket.id}`);
  };
  
  return (
    <div 
      className="ticket-card"
      style={{ borderLeft: `5px solid ${getPriorityColor(ticket.priority)}` }}
      onClick={handleClick}
    >
      <div className="ticket-card-header">
        <span className="ticket-number">{ticket.ticket_number}</span>
        <span 
          className="priority-badge"
          style={{ background: getPriorityColor(ticket.priority) }}
        >
          {getPriorityBadge(ticket.priority)}
        </span>
      </div>
      
      <h3 className="ticket-subject">{ticket.subject}</h3>
      
      {ticket.description && (
        <p className="ticket-description">
          {ticket.description.length > 100 
            ? ticket.description.substring(0, 100) + '...'
            : ticket.description
          }
        </p>
      )}
      
      <div className="ticket-meta">
        <div className="meta-item">
          <span className="meta-icon">👤</span>
          <span>{ticket.customer_name || ticket.customer_email}</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-icon">📅</span>
          <span>{formatDate(ticket.created_at)}</span>
        </div>
      </div>
      
      <div className="ticket-card-footer">
        <span 
          className="status-badge"
          style={{ background: statusInfo.color }}
        >
          {statusInfo.text}
        </span>
        
        <span 
          className="sla-timer"
          style={{ color: slaInfo.color }}
        >
          {slaInfo.text}
        </span>
      </div>
      
      {ticket.agent_name && (
        <div className="assigned-agent">
          <span className="agent-icon">👨‍💼</span>
          <span>{ticket.agent_name}</span>
        </div>
      )}
    </div>
  );
}

export default TicketCard;