import { useState } from 'react';

import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Building,
  BarChart3,
  Settings,
  Shield,
  Bell,
  Database,
  UserCheck,
  Calendar,
  FileText,
  DollarSign,
  Mail,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import AdminManageTeachers from './AdminManageTeachers'
import AdminManageStudents from './AdminManageStudents'
const PlaceholderPage = ({ title, description }) => (
  <div className="space-y-8">
    <div className="text-center mb-8">
  <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-gray-400 mb-4">
        {title}
      </h2>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        {description}
      </p>
    </div>

    <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 text-center">
      <div className="mb-4">
  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Admin Module</h3>
        <p className="text-gray-300 mb-4">
          This module would be imported from: <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">./admin/{title.replace(/\s+/g, '')}</code>
        </p>
        <p className="text-sm text-gray-400">
          Create a separate component file and import it at the top of this dashboard
        </p>
      </div>
    </div>
  </div>
);

const AdminOverview = () => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-gray-400 mb-4">
        Admin Dashboard
      </h2>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        System overview and administrative controls for platform management
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <Users className="w-8 h-8 text-cyan-400" />
          <span className="text-2xl font-bold text-white">2,847</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
        <p className="text-green-400 text-sm">+127 this month</p>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <GraduationCap className="w-8 h-8 text-cyan-400" />
          <span className="text-2xl font-bold text-white">89</span>
        </div>
    <h3 className="text-lg font-semibold text-white mb-2">Active Conductors</h3>
  <p className="text-cyan-400 text-sm">7 recently assigned</p>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <BookOpen className="w-8 h-8 text-cyan-400" />
          <span className="text-2xl font-bold text-white">342</span>
        </div>
  <h3 className="text-lg font-semibold text-white mb-2">Registered Vehicles</h3>
  <p className="text-blue-400 text-sm">18 pending inspection</p>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <Activity className="w-8 h-8 text-cyan-400" />
          <span className="text-2xl font-bold text-white">94%</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">System Uptime</h3>
        <p className="text-green-400 text-sm">All systems operational</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-cyan-400" />
          System Alerts
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-cyan-500/20 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
              <div>
                <p className="text-white font-medium">High Server Load</p>
                <p className="text-gray-300 text-sm">Database server at 85% capacity</p>
              </div>
            </div>
            <span className="text-cyan-400 text-sm">Critical</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-500/20 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              <div>
                <p className="text-white font-medium">Pending User Approvals</p>
                <p className="text-gray-300 text-sm">24 teacher registrations awaiting review</p>
              </div>
            </div>
            <span className="text-yellow-400 text-sm">Warning</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <div>
                <p className="text-white font-medium">Backup Completed</p>
                <p className="text-gray-300 text-sm">Daily system backup successful</p>
              </div>
            </div>
            <span className="text-green-400 text-sm">Success</span>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
          Platform Statistics
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
          <span className="text-gray-300">Daily Active Riders</span>
            <span className="text-white font-bold">1,234</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '78%' }}></div>
          </div>
          
          <div className="flex items-center justify-between">
          <span className="text-gray-300">Transaction Success Rate</span>
              <span className="text-gray-300">Average Fare Collected</span>
              <span className="text-white font-bold">$1,234</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '67%' }}></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Storage Usage</span>
            <span className="text-white font-bold">2.4TB / 5TB</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '48%' }}></div>
          </div>
        </div>
      </div>
    </div>

    <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
  <CheckCircle className="w-5 h-5 mr-2 text-cyan-400" />
        Recent Administrative Actions
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-500/20 rounded-lg">
          <div className="flex items-center">
            <UserCheck className="w-4 h-4 text-cyan-400 mr-3" />
            <div>
              <p className="text-white font-medium">Conductor approved: Ahmed Ali</p>
              <p className="text-gray-300 text-sm">Assigned to Route 12</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">2 hours ago</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-500/20 rounded-lg">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 text-cyan-400 mr-3" />
            <div>
              <p className="text-white font-medium">Vehicle registered: Bus B-204</p>
              <p className="text-gray-300 text-sm">Inspection completed</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">5 hours ago</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-500/20 rounded-lg">
          <div className="flex items-center">
            <Settings className="w-4 h-4 text-cyan-400 mr-3" />
            <div>
              <p className="text-white font-medium">System maintenance scheduled</p>
              <p className="text-gray-300 text-sm">Database optimization - Tonight 2:00 AM</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">1 day ago</span>
        </div>
      </div>
    </div>
  </div>
);

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
  <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/20 rounded-full blur-3xl animate-pulse"></div>
  <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl animate-spin-slower"></div>
  </div>
);

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
  { id: 'overview', label: 'Dashboard', icon: Home, description: 'System overview and key metrics' },
  { id: 'passenger_management', label: 'Passenger Management', icon: Users, description: 'Manage registered passengers and accounts' },
  { id: 'conductor_management', label: 'Conductor Management', icon: UserCheck, description: 'Approve and manage conductors' },
  { id: 'fleet_management', label: 'Fleet Management', icon: BookOpen, description: 'Manage vehicles and inspections' },
    { id: 'institution_settings', label: 'Institution Settings', icon: Building, description: 'Configure institutional parameters' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, description: 'Platform analytics and reporting' },
    { id: 'financial', label: 'Financial Overview', icon: DollarSign, description: 'Revenue and financial metrics' },
    { id: 'system_logs', label: 'System Logs', icon: Database, description: 'View system activity logs' },
    { id: 'backup_restore', label: 'Backup & Restore', icon: Shield, description: 'Data backup and recovery' },
    { id: 'scheduling', label: 'System Scheduling', icon: Calendar, description: 'Manage system maintenance' },
    { id: 'content_moderation', label: 'Content Moderation', icon: FileText, description: 'Review and moderate content' },
    { id: 'notifications', label: 'System Notifications', icon: Bell, description: 'Platform-wide notifications' },
    { id: 'email_management', label: 'Email Management', icon: Mail, description: 'Configure email settings' },
    { id: 'support', label: 'Support Center', icon: HelpCircle, description: 'Admin support and documentation' },
    { id: 'settings', label: 'System Settings', icon: Settings, description: 'Configure platform settings' },
  ];

  const renderPage = () => {
    const currentMenuItem = menuItems.find((item) => item.id === currentPage);
    switch (currentPage) {
      case 'overview': 
        return <AdminOverview />;
      case 'AdminManagingStudents':
        return <AdminManageStudents/>;
      case 'AdminManageTeachers':
        return <AdminManageTeachers/>
      default:
        return <PlaceholderPage title={currentMenuItem?.label || 'Page Not Found'} description={currentMenuItem?.description || "This section is under development"} />;
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-gray-900 relative overflow-hidden">
      <AnimatedBackground />
      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <div className={`backdrop-blur-md bg-black/20 border-r border-white/10 shadow-2xl transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-cyan-400 mr-2" />
                  <h1 className="text-xl font-bold text-white bg-gradient-to-r from-cyan-400 to-gray-400 bg-clip-text text-transparent">
                    AdminHub
                  </h1>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-white hover:scale-105"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </div>

          <nav className="mt-4 overflow-y-auto max-h-[calc(100vh-120px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-all duration-300 hover:scale-105 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-gray-500/20 border-r-2 border-cyan-400 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={!sidebarCollapsed ? item.description : item.label}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 relative z-10">
            <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl border border-gray-700 shadow-xl min-h-[calc(100vh-4rem)] p-4 md:p-8">
              {renderPage()}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes spin-slower { to { transform: rotate(360deg); } }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        .animate-pulse-slow { animation: pulse 3s infinite; }
        .animate-spin-slower { animation: spin-slower 8s linear infinite; }
        nav::-webkit-scrollbar { width: 4px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
        nav::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
};

export default AdminDashboard;