import { useState } from 'react';
import StaffActivityMonitor from '../../components/admin/StaffActivityMonitor';
import AdminStats from '../../components/admin/AdminStats';
import SystemReports from '../../components/admin/SystemReports';
import SystemSettings from '../../components/admin/SystemSettings';
import UserTypeStats from '../../components/admin/UserTypeStats';
import StaffActivity from '../../components/admin/StaffActivity';
// Import operator components for admin use
import UserManagement from '../../components/operator/UserManagement';
import PaymentVerification from '../../components/operator/PaymentVerification';
import OperatorStats from '../../components/operator/OperatorStats';
import { LogOut, Users, DollarSign, Activity, BarChart3, Home, Menu, Settings } from 'lucide-react';

const AdminSidebar = ({ current, setCurrent, isExpanded, toggleExpanded }) => {
  const items = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'payments', label: 'Payment Verification', icon: DollarSign },
    { id: 'activity', label: 'Staff Activity', icon: Activity },
    { id: 'reports', label: 'System Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Log out', icon: LogOut },
  ];
  const mainItems = items.filter(it => it.id !== 'logout');
  const logoutItem = items.find(it => it.id === 'logout');
  const LogoutIcon = logoutItem.icon;
  const iconSize = isExpanded ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div className={`fixed left-0 top-0 backdrop-blur-md bg-black/20 border-r border-white/10 ${isExpanded ? 'p-4 w-64' : 'p-2 w-24'} h-screen flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-50`}>
      <div className={`mb-6 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} transition-all duration-500`}>
        <div className={isExpanded ? '' : 'hidden'}>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        </div>
        <button onClick={toggleExpanded} className="text-white hover:text-gray-300 p-1">
          <Menu className={`stroke-current transition-transform duration-500 ${iconSize} ${isExpanded ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>
      <nav className="space-y-2 flex-1">
        {mainItems.map(it => {
          const Icon = it.icon;
          return (
            <button 
              key={it.id} 
              onClick={() => setCurrent(it.id)} 
              title={isExpanded ? '' : it.label} 
              className={`w-full flex items-center ${isExpanded ? 'gap-3' : ''} p-3 rounded transition-all duration-500 ${current === it.id ? 'bg-cyan-600/20 text-white' : 'text-white hover:bg-white/5'} ${isExpanded ? 'justify-start' : 'justify-center'}`}
            >
              <Icon className={`${iconSize} stroke-current transition-all duration-500`} />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>
                {it.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto">
        <button 
          onClick={() => setCurrent(logoutItem.id)} 
          title={isExpanded ? '' : logoutItem.label} 
          className={`w-full flex items-center ${isExpanded ? 'gap-3' : ''} p-3 rounded transition-all duration-500 text-white hover:bg-white/5 ${isExpanded ? 'justify-start' : 'justify-center'}`}
        >
          <LogoutIcon className={`${iconSize} stroke-current transition-all duration-500`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>
            {logoutItem.label}
          </span>
        </button>
      </div>
    </div>
  );
};

import PropTypes from 'prop-types';
AdminSidebar.propTypes = {
  current: PropTypes.string.isRequired,
  setCurrent: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  toggleExpanded: PropTypes.func.isRequired,
};

const AdminDashboard = () => {
  const [current, setCurrent] = useState('overview');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const renderContent = () => {
    switch (current) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white mb-4">Admin Dashboard</h1>
            <AdminStats />
            <UserTypeStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <OperatorStats />
              <StaffActivity />
            </div>
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'payments':
        return <PaymentVerification />;
      case 'activity':
        return <StaffActivityMonitor />;
      case 'reports':
        return <SystemReports />;
      case 'settings':
        return <SystemSettings />;
      case 'logout':
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white">
      <div className="flex">
        <AdminSidebar 
          current={current} 
          setCurrent={setCurrent} 
          isExpanded={isSidebarExpanded} 
          toggleExpanded={() => setIsSidebarExpanded(!isSidebarExpanded)} 
        />
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

export default AdminDashboard;
