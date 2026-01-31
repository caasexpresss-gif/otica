
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Orders from './components/Orders.tsx';
import LensAdvisor from './components/LensAdvisor.tsx';
import Customers from './components/Customers.tsx';
import Reports from './components/Reports.tsx';
import Inventory from './components/Inventory.tsx';
import Finance from './components/Finance.tsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/lens-advisor" element={<LensAdvisor />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
