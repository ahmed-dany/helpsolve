import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Common/Layout';
import TicketListSalesforce from './components/Ticket/TicketListSalesforce';
import TicketDetailPage from './pages/TicketDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<TicketListSalesforce />} />
          <Route path="/tickets" element={<TicketListSalesforce />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;