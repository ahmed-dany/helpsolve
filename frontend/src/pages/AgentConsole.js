import React from 'react';
import Header from '../components/Common/Header';
import TicketList from '../components/Ticket/TicketList';

function AgentConsole() {
  return (
    <div className="agent-console">
      <Header />
      <main>
        <div className="page-header">
          <h2>📋 Mes Tickets</h2>
          <button className="btn-primary">
            ➕ Nouveau Ticket
          </button>
        </div>
        <TicketList />
      </main>
    </div>
  );
}

export default AgentConsole;