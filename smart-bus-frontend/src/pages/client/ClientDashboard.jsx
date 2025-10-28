import { useState } from 'react';
import ActiveCards from '../../components/client/ActiveCards';
import TransactionsList from '../../components/client/TransactionsList';
import CardManagement from '../../components/client/CardManagement';
import ManualPayment from '../../components/client/ManualPayment';
import FaceAuthSettings from '../../Components/faceAuth/FaceAuthSettings';
import { LogOut, CreditCard, List, Home, Menu, DollarSign, Info, Settings } from 'lucide-react';

const ClientSidebar = ({ current, setCurrent, isExpanded, toggleExpanded }) => {
  const items = [
    { id: 'main', label: 'Main Dashboard', icon: Home },
    { id: 'cards', label: 'Card Management', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: List },
    { id: 'manual-payment', label: 'Manual Payment', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Log out', icon: LogOut },
  ];
  const mainItems = items.filter(it => it.id !== 'logout');
  const logoutItem = items.find(it => it.id === 'logout');
  const LogoutIcon = logoutItem.icon;
  const iconSize = isExpanded ? 'w-6 h-6' : 'w-8 h-8';
  return (
  <div className={`fixed left-0 top-0 backdrop-blur-md bg-black/20 border-r border-white/10 ${isExpanded ? 'p-4 w-64' : 'p-2 w-24'} h-screen flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-50`} style={{ willChange: 'width, padding' }}>
  <div className={`mb-6 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}>
        <div className={isExpanded ? '' : 'hidden'}>
          <h2 className="text-xl font-bold text-white">Client Hub</h2>
        </div>
        <button onClick={toggleExpanded} className="text-white hover:text-gray-300 p-1">
          <Menu className={`stroke-current origin-center transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${iconSize} ${isExpanded ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>
      <nav className="space-y-2 flex-1">
        {mainItems.map(it => {
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => setCurrent(it.id)} title={isExpanded ? '' : it.label} className={`w-full flex items-center ${isExpanded ? 'gap-3' : ''} p-3 rounded transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${current === it.id ? 'bg-cyan-600/20 text-white' : 'text-white hover:bg-white/5'} ${isExpanded ? 'justify-start' : 'justify-center'}`}>
              <Icon className={`${iconSize} stroke-current transform-gpu transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`} />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>{it.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto">
        <button onClick={() => setCurrent(logoutItem.id)} title={isExpanded ? '' : logoutItem.label} className={`w-full flex items-center ${isExpanded ? 'gap-3' : ''} p-3 rounded transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${current === logoutItem.id ? 'bg-cyan-600/20 text-white' : 'text-white hover:bg-white/5'} ${isExpanded ? 'justify-start' : 'justify-center'}`}>
          <LogoutIcon className={`${iconSize} stroke-current transform-gpu transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>{logoutItem.label}</span>
        </button>
      </div>
    </div>
  );
};
import PropTypes from 'prop-types';
ClientSidebar.propTypes = {
  current: PropTypes.string.isRequired,
  setCurrent: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  toggleExpanded: PropTypes.func.isRequired,
};

const ClientDashboard = () => {
  const [current, setCurrent] = useState('main');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const renderContent = () => {
    switch (current) {
      case 'main':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-4 text-white">My Cards</h1>
            
            {/* Currency Information Banner */}
            <div className="mb-6 backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-cyan-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white mb-1">Currency Information</h3>
                  <p className="text-cyan-100 text-sm">
                    Our smart bus system uses <span className="font-bold text-cyan-300">T-Pay</span> coins as currency.
                  </p>
                  <p className="text-cyan-200 text-sm mt-1">
                    💰 <span className="font-semibold">Conversion Rate:</span> 1 DT (Dinar) = 1 T-Pay
                  </p>
                </div>
              </div>
            </div>

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
      case 'manual-payment':
        return <ManualPayment />;
      case 'settings':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Settings</h1>
            <FaceAuthSettings token={localStorage.getItem('token')} />
          </div>
        );
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
        <ClientSidebar current={current} setCurrent={setCurrent} isExpanded={isSidebarExpanded} toggleExpanded={() => setIsSidebarExpanded(!isSidebarExpanded)} />
        <main className={`flex-1 min-h-screen overflow-y-auto ${isSidebarExpanded ? 'ml-64' : 'ml-24'} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}>
          <div className="p-6">
            <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl border border-gray-700 p-6">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
