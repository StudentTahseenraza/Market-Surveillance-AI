// src/components/common/Navbar.jsx
// import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useWebSocket } from '@hooks/useWebSocket';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  BellIcon, 
  ChartBarIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { alerts, clearAlerts } = useWebSocket();
  const navigate = useNavigate();
//   const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-8 left-0 right-0 bg-white shadow-md z-40">
      <div className="px-4 mx-auto">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link to="/dashboard" className="flex items-center ml-4">
              <ChartBarIcon className="w-8 h-8 text-primary-800" />
              <span className="ml-2 text-xl font-bold text-primary-800">
                Market Surveillance AI
              </span>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none relative">
                <BellIcon className="w-6 h-6" />
                {alerts.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 w-96 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-3 bg-gray-50 rounded-t-md flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Notifications</span>
                    {alerts.length > 0 && (
                      <button
                        onClick={clearAlerts}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <BellAlertIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm">No new alerts</p>
                      </div>
                    ) : (
                      alerts.map((alert, index) => (
                        <Menu.Item key={index}>
                          {({ active }) => (
                            <div className={`px-4 py-3 ${active ? 'bg-gray-50' : ''} border-b border-gray-100 last:border-0`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                    🚨 Anomaly
                                  </span>
                                  <p className="mt-1 text-sm font-medium text-gray-900">
                                    {alert.symbol}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Risk Score: {alert.risk_score} - {alert.risk_level}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(alert.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  alert.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                                  alert.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {alert.risk_level}
                                </span>
                              </div>
                            </div>
                          )}
                        </Menu.Item>
                      ))
                    )}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none">
                <UserCircleIcon className="w-6 h-6" />
                <span className="text-sm font-medium hidden md:block">
                  {user?.username}
                </span>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/reports')}
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } group flex items-center w-full px-4 py-2 text-sm`}
                        >
                          <DocumentTextIcon className="w-5 h-5 mr-3 text-gray-400" />
                          Reports
                        </button>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/settings')}
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } group flex items-center w-full px-4 py-2 text-sm`}
                        >
                          <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                          Settings
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } group flex items-center w-full px-4 py-2 text-sm`}
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-gray-400" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;