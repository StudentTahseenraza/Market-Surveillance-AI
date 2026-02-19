// src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import {
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  FolderOpenIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ open, onClose }) => {
  const { isAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Analysis', href: '/analysis', icon: ChartBarIcon },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
    { name: 'Upload Data', href: '/upload', icon: FolderOpenIcon },
    { name: 'Audit Logs', href: '/audit-logs', icon: ClockIcon, adminOnly: true },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-8 left-0 z-40 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
          open ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full px-3 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center p-2 text-base font-normal rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary-800 text-white'
                          : 'text-gray-900 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className={`w-6 h-6 transition duration-75 ${
                      open ? 'mr-3' : 'mx-auto'
                    }`} />
                    {open && <span>{item.name}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
          
          {open && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center">
                  <ArrowPathIcon className="w-5 h-5 text-primary-800 animate-spin" />
                  <span className="ml-2 text-xs font-medium text-primary-800">
                    Live Monitoring
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  Real-time anomaly detection active
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;