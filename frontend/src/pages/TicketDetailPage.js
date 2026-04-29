import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiClock, 
  FiUser,
  FiMail,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiMessageSquare,
  FiEdit,
  FiX
} from 'react-icons/fi';
import { ticketService } from '../services/api';
import { 
  getPriorityColor,
  getStatusBadge,
  formatDate,
  calculateTimeRemaining,
  getCurrentAgent
} from '../utils/helpers';
import './TicketDetailPage.css';

function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentAgent = getCurrentAgent();
  console.log("currentAgent =", currentAgent);
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  
  useEffect(() => {
    loadTicket();
  }, [id]);
  
  const loadTicket = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getById(id);
      setTicket(response.data.ticket);
      setSelectedStatus(response.data.ticket.status);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du ticket');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignToMe = async () => {
    try {
        if (!currentAgent || !currentAgent.id) {
        alert("Agent non défini");
        console.error("currentAgent:", currentAgent);
        return;
        }

        console.log("Assignation avec agent:", currentAgent.id);

        await ticketService.assign(id, currentAgent.id);
        loadTicket();

    } catch (err) {
        console.error(err.response?.data || err);
        alert(err.response?.data?.message || "Erreur lors de l'assignation");
    }
  };
  
  
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    
    try {
      await ticketService.addNote(id, currentAgent.id, noteContent);
      setNoteContent('');
      setShowNoteForm(false);
      loadTicket();
    } catch (err) {
      alert('Erreur lors de l\'ajout de la note');
    }
  };
  
  const handleChangeStatus = async () => {
    try {
      await ticketService.updateStatus(id, selectedStatus, currentAgent.id);
      setShowStatusModal(false);
      loadTicket();
    } catch (err) {
      alert('Erreur lors du changement de statut');
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-sf"></div>
        <p>Chargement du ticket...</p>
      </div>
    );
  }
  
  if (error || !ticket) {
    return (
      <div className="error-container">
        <FiAlertCircle size={48} />
        <h2>{error || 'Ticket non trouvé'}</h2>
        <button onClick={() => navigate('/tickets')} className="btn-primary">
          Retour aux tickets
        </button>
      </div>
    );
  }
  
  const slaInfo = calculateTimeRemaining(ticket.sla_deadline);
  const statusInfo = getStatusBadge(ticket.status);
  
  return (
    <div className="ticket-detail-page">
      {/* HEADER */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/tickets')}>
          <FiArrowLeft />
          Retour aux tickets
        </button>
        
        <div className="ticket-header-info">
          <h1 className="ticket-title">{ticket.subject}</h1>
          <div className="ticket-meta-header">
            <span className="ticket-number-detail">{ticket.ticket_number}</span>
            <span className="separator">•</span>
            <span>Créé {formatDate(ticket.created_at)}</span>
          </div>
        </div>
      </div>
      
      {/* CONTENT GRID */}
      <div className="detail-grid">
        {/* COLONNE PRINCIPALE */}
        <div className="main-column">
          {/* DESCRIPTION */}
          <div className="card-sf">
            <div className="card-header-sf">
              <h3>Description</h3>
            </div>
            <div className="card-body-sf">
              <p className="ticket-description-detail">
                {ticket.description || 'Aucune description fournie.'}
              </p>
            </div>
          </div>
          
          {/* TIMELINE DES ACTIVITÉS */}
          <div className="card-sf">
            <div className="card-header-sf">
              <h3>Historique</h3>
              <button 
                className="btn-secondary-sm"
                onClick={() => setShowNoteForm(!showNoteForm)}
              >
                <FiMessageSquare />
                Ajouter une note
              </button>
            </div>
            
            {showNoteForm && (
              <div className="note-form-container">
                <form onSubmit={handleAddNote}>
                  <textarea
                    className="note-textarea"
                    placeholder="Écrire une note interne..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={4}
                    autoFocus
                  />
                  <div className="note-form-actions">
                    <button type="submit" className="btn-primary">
                      Ajouter
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        setShowNoteForm(false);
                        setNoteContent('');
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="card-body-sf">
              {ticket.activities && ticket.activities.length > 0 ? (
                <div className="timeline">
                  {ticket.activities.map((activity) => {
                    // Trouver le contenu de la note si c'est une activité "note_added"
                    let noteContent = null;
                    if (activity.action_type === 'note_added' && ticket.notes) {
                      noteContent = ticket.notes.find(note => {
                        const noteTime = new Date(note.created_at).getTime();
                        const activityTime = new Date(activity.timestamp).getTime();
                        return Math.abs(noteTime - activityTime) < 5000;
                      });
                    }
                    
                    return (
                      <div key={activity.id} className="timeline-item">
                        <div className="timeline-marker">
                          {getActivityIcon(activity.action_type)}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-action">
                              {getActivityLabel(activity.action_type)}
                            </span>
                            <span className="timeline-time">
                              {formatDate(activity.timestamp)}
                            </span>
                          </div>
                          
                          {/* Afficher le contenu de la note si disponible */}
                          {noteContent ? (
                            <div className="note-content-box">
                              <p className="note-text">{noteContent.content}</p>
                              <div className="note-author">
                                — {noteContent.agent_name || 'Agent'}
                              </div>
                            </div>
                          ) : (
                            activity.description && (
                              <p className="timeline-description">
                                {activity.description}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-timeline">
                  <FiMessageSquare size={32} />
                  <p>Aucune activité pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* SIDEBAR */}
        <div className="sidebar-column">
          {/* ACTIONS RAPIDES */}
          <div className="card-sf">
            <div className="card-header-sf">
              <h3>Actions</h3>
            </div>
            <div className="card-body-sf actions-container">
              {!ticket.agent_id && (
                <button 
                  className="btn-action"
                  onClick={handleAssignToMe}
                >
                  <FiUser />
                  M'assigner ce ticket
                </button>
              )}
              
              <button 
                className="btn-action"
                onClick={() => setShowStatusModal(true)}
              >
                <FiEdit />
                Changer le statut
              </button>
            </div>
          </div>
          
          {/* DÉTAILS */}
          <div className="card-sf">
            <div className="card-header-sf">
              <h3>Détails</h3>
            </div>
            <div className="card-body-sf">
              <div className="detail-item">
                <label className="detail-label">Statut</label>
                <span 
                  className={`status-badge-sf ${statusInfo.class}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              
              <div className="detail-item">
                <label className="detail-label">Priorité</label>
                <span 
                  className="priority-badge-detail"
                  style={{ 
                    color: getPriorityColor(ticket.priority),
                    borderColor: getPriorityColor(ticket.priority)
                  }}
                >
                  <FiAlertCircle />
                  {ticket.priority}
                </span>
              </div>
              
              <div className="detail-item">
                <label className="detail-label">Canal</label>
                <span className="detail-value">{ticket.channel}</span>
              </div>
              
              <div className="detail-item">
                <label className="detail-label">SLA</label>
                <span 
                  className="sla-badge"
                  style={{ color: slaInfo.color }}
                >
                  <FiClock />
                  {slaInfo.text}
                </span>
              </div>
              
              <div className="detail-item">
                <label className="detail-label">Agent assigné</label>
                {ticket.agent_name ? (
                  <div className="agent-info-detail">
                    <div className="agent-avatar-detail">
                      {ticket.agent_name.charAt(0)}
                    </div>
                    <span>{ticket.agent_name}</span>
                  </div>
                ) : (
                  <span className="text-muted">Non assigné</span>
                )}
              </div>
            </div>
          </div>
          
          {/* INFORMATIONS CLIENT */}
          <div className="card-sf">
            <div className="card-header-sf">
              <h3>Client</h3>
            </div>
            <div className="card-body-sf">
              <div className="detail-item">
                <label className="detail-label">Nom</label>
                <span className="detail-value">
                  {ticket.customer_name || 'N/A'}
                </span>
              </div>
              
              <div className="detail-item">
                <label className="detail-label">Email</label>
                <a 
                  href={`mailto:${ticket.customer_email}`}
                  className="detail-link"
                >
                  <FiMail />
                  {ticket.customer_email}
                </a>
              </div>
              
              {ticket.customer_phone && (
                <div className="detail-item">
                  <label className="detail-label">Téléphone</label>
                  <span className="detail-value">{ticket.customer_phone}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* DATES */}
          <div className="card-sf">
            <div className="card-header-sf">
              <h3>Chronologie</h3>
            </div>
            <div className="card-body-sf">
              <div className="detail-item">
                <label className="detail-label">Créé le</label>
                <span className="detail-value">
                  {new Date(ticket.created_at).toLocaleString('fr-FR')}
                </span>
              </div>
              
              <div className="detail-item">
                <label className="detail-label">Mis à jour</label>
                <span className="detail-value">
                  {new Date(ticket.updated_at).toLocaleString('fr-FR')}
                </span>
              </div>
              
              {ticket.resolved_at && (
                <div className="detail-item">
                  <label className="detail-label">Résolu le</label>
                  <span className="detail-value">
                    {new Date(ticket.resolved_at).toLocaleString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* MODAL CHANGEMENT DE STATUT */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Changer le statut</h3>
              <button 
                className="btn-close"
                onClick={() => setShowStatusModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <label className="form-label">Nouveau statut</label>
              <select 
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="New">Nouveau</option>
                <option value="Open">Ouvert</option>
                <option value="Pending">En attente</option>
                <option value="Resolved">Résolu</option>
                <option value="Closed">Fermé</option>
              </select>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn-primary"
                onClick={handleChangeStatus}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fonction helper pour les icônes d'activité
function getActivityIcon(actionType) {
  switch(actionType) {
    case 'created':
      return <FiCheckCircle className="activity-icon created" />;
    case 'assigned':
      return <FiUser className="activity-icon assigned" />;
    case 'status_changed':
      return <FiEdit className="activity-icon status" />;
    case 'note_added':
      return <FiMessageSquare className="activity-icon note" />;
    default:
      return <FiCheckCircle className="activity-icon default" />;
  }
}

// Fonction helper pour les labels d'activité
function getActivityLabel(actionType) {
  switch(actionType) {
    case 'created':
      return 'Ticket créé';
    case 'assigned':
      return 'Ticket assigné';
    case 'status_changed':
      return 'Statut modifié';
    case 'note_added':
      return 'Note ajoutée';
    default:
      return 'Activité';
  }
}

export default TicketDetailPage;