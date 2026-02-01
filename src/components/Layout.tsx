
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ShoppingBag, Glasses, BrainCircuit, Menu, X, FileBarChart, Package, DollarSign, LogOut, Briefcase } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Painel Gerencial', icon: LayoutDashboard },
    { path: '/customers', label: 'Clientes', icon: Users },
    { path: '/orders', label: 'Ordens de Serviço', icon: ShoppingBag },
    { path: '/pos', label: 'PDV / Caixa', icon: ShoppingBag },
    { path: '/inventory', label: 'Estoque', icon: Package },
    { path: '/finance', label: 'Financeiro', icon: DollarSign },
    { path: '/lens-advisor', label: 'Consultor IA', icon: BrainCircuit },
    { path: '/reports', label: 'Relatórios', icon: FileBarChart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
          <div className="flex items-center space-x-2">
            <Glasses className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold tracking-wider">OptiSaaS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-colors
                  ${active 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full bg-slate-950">
           <div className="p-4 border-t border-slate-900">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-teal-500 flex items-center justify-center text-xs font-bold uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {tenant?.name}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-slate-900 hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors text-xs font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-gray-800">{tenant?.name || 'OptiSaaS'}</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
