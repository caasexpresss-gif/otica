
import React from 'react';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Orders from './components/Orders.tsx';
import LensAdvisor from './components/LensAdvisor.tsx';
import Customers from './components/Customers.tsx';
import Reports from './components/Reports.tsx';
import Inventory from './components/Inventory.tsx';
import Finance from './components/Finance.tsx';
import PosTerminal from './components/POS/PosTerminal.tsx';

import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

// Route Guard
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  const [showSlowMessage, setShowSlowMessage] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setShowSlowMessage(true), 3000); // Show help after 3s
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 text-sm">Carregando sistema...</p>
        
        {showSlowMessage && (
            <div className="mt-8 text-center animate-fade-in">
                <p className="text-gray-400 text-xs mb-2">Está demorando mais que o normal?</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="text-blue-600 text-xs hover:underline mr-4"
                >
                    Recarregar
                </button>
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/#/login'; 
                        window.location.reload();
                    }}
                    className="text-red-500 text-xs hover:underline"
                >
                    Sair e Tentar Novamente
                </button>
            </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
             {/* Public Routes */}
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />

             {/* Protected Routes */}
             <Route path="*" element={
               <RequireAuth>
                 <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/pos" element={<PosTerminal />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/finance" element={<Finance />} />
                      <Route path="/lens-advisor" element={<LensAdvisor />} />
                      <Route path="/reports" element={<Reports />} />
                    </Routes>
                 </Layout>
               </RequireAuth>
             } />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
