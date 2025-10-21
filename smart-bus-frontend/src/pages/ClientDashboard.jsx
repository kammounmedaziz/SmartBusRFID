// JSX runtime (React 17+) handles React import automatically
import { useState } from 'react';
import ActiveCards from '../components/client/ActiveCards';
import TransactionsList from '../components/client/TransactionsList';
import CardManagement from '../components/client/CardManagement';
import { LogOut, CreditCard, List, Home } from 'lucide-react';

const ClientSidebar = ({ current, setCurrent }) => {
  const items = [
    { id: 'main', label: 'Main Dashboard', icon: Home },
    { id: 'cards', label: 'Card Management', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: List },
    { id: 'logout', label: 'Log out', icon: LogOut },
  ];
  return (
    <div className="backdrop-blur-md bg-black/20 border-r border-white/10 w-64 p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Client Hub</h2>
        <p className="text-gray-400 text-sm">Manage your cards and transactions</p>
      </div>
      <nav className="space-y-2">
        {items.map(it => {
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => setCurrent(it.id)} className={`w-full flex items-center gap-3 p-3 rounded ${current === it.id ? 'bg-cyan-600/20 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
              <Icon className="w-5 h-5" />
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
import PropTypes from 'prop-types';
ClientSidebar.propTypes = {
  current: PropTypes.string.isRequired,
  setCurrent: PropTypes.func.isRequired,
};

const ClientDashboard = () => {
  const [current, setCurrent] = useState('main');

  const renderContent = () => {
    switch (current) {
      case 'main':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-4">My Cards</h1>
            <ActiveCards />
            <div className="mt-6">
              <TransactionsList />
            </div>
          </div>
        );
      case 'cards':
        return <CardManagement />;
      case 'transactions':
        return <TransactionsList />;
      case 'logout':
        // clear token and redirect to home
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        window.location.href = '/';
        return null;
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-gray-900 text-white">
      <div className="flex">
        <ClientSidebar current={current} setCurrent={setCurrent} />
        <main className="flex-1 p-6">
          <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl border border-gray-700 p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
