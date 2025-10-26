import { useState } from 'react';
import ManualPaymentsMonitor from '../../components/admin/ManualPaymentsMonitor';
import ControllerActivityMonitor from '../../components/admin/ControllerActivityMonitor';
import { LogOut, DollarSign, Activity, Home, Menu } from 'lucide-react';

const AdminSidebar = ({ current, setCurrent, isExpanded, toggleExpanded }) => {
  const items = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'payments', label: 'Manual Payments', icon: DollarSign },
    { id: 'controllers', label: 'Controller Activity', icon: Activity },
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

const Overview = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard Overview</h2>
        <p className="text-gray-600 mb-6">
          Welcome to the admin dashboard. Here you can monitor and manage the entire smart bus system.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="text-sm font-medium opacity-90">Manual Payments</div>
            <div className="text-4xl font-bold mt-2">Monitor</div>
            <div className="text-sm mt-2 opacity-75">Approve or reject payment requests</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="text-sm font-medium opacity-90">Controller Activity</div>
            <div className="text-4xl font-bold mt-2">Track</div>
            <div className="text-sm mt-2 opacity-75">Monitor validation and logs</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="text-sm font-medium opacity-90">System Status</div>
            <div className="text-4xl font-bold mt-2">Active</div>
            <div className="text-sm mt-2 opacity-75">All systems operational</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
            <div className="font-medium text-gray-800">Review Pending Payments</div>
            <div className="text-sm text-gray-600">Check and approve manual payment requests from users</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
            <div className="font-medium text-gray-800">Monitor Controller Activity</div>
            <div className="text-sm text-gray-600">View validation logs and controller performance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [current, setCurrent] = useState('overview');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const renderContent = () => {
    switch (current) {
      case 'overview':
        return <Overview />;
      case 'payments':
        return <ManualPaymentsMonitor />;
      case 'controllers':
        return <ControllerActivityMonitor />;
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
