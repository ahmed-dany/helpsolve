export const getPriorityColor = (priority) => {
  switch(priority) {
    case 'Critical': return '#e74c3c';
    case 'High': return '#e67e22';
    case 'Normal': return '#3498db';
    case 'Low': return '#95a5a6';
    default: return '#3498db';
  }
};

export const getPriorityBadge = (priority) => {
  switch(priority) {
    case 'Critical': return '🔴 Critique';
    case 'High': return '🟠 Haute';
    case 'Normal': return '🔵 Normale';
    case 'Low': return '⚪ Basse';
    default: return '🔵 Normale';
  }
};

export const calculateTimeRemaining = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diffMs = end - now;
  const diffMins = Math.floor(diffMs / 1000 / 60);
  
  if (diffMins < 0) {
    return {
      text: '⚠️ Dépassé',
      color: '#e74c3c',
      expired: true
    };
  }
  
  if (diffMins < 30) {
    return {
      text: `⏱️ ${diffMins} min`,
      color: '#e74c3c',
      expired: false
    };
  }
  
  if (diffMins < 60) {
    return {
      text: `⏱️ ${diffMins} min`,
      color: '#e67e22',
      expired: false
    };
  }
  
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  return {
    text: `⏱️ ${hours}h ${mins}min`,
    color: '#27ae60',
    expired: false
  };
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 60) {
    return `Il y a ${diffMins} min`;
  }
  
  if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  }
  
  if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  }
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getStatusBadge = (status) => {
  const badges = {
    'New': { text: '🆕 Nouveau', color: '#3498db' },
    'Open': { text: '📂 Ouvert', color: '#f39c12' },
    'Pending': { text: '⏸️ En attente', color: '#95a5a6' },
    'Resolved': { text: '✅ Résolu', color: '#27ae60' },
    'Closed': { text: '🔒 Fermé', color: '#7f8c8d' }
  };
  
  return badges[status] || badges['New'];
};

export const getCurrentAgent = () => {
  return {
    id: "69f0825aca0e3aad10a15914",
    name: 'Thomas Martin',
    email: 'thomas@helpsolve.com',
    team: 'Technique'
  };
};