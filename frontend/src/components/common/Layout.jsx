// src/components/common/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useWebSocket } from '@hooks/useWebSocket';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { connected } = useWebSocket();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 text-white text-center py-1 text-sm ${
        connected ? 'bg-green-600' : 'bg-red-600'
      }`}>
        {connected ? '🟢 Real-time Connected' : '🔴 Real-time Disconnected - Reconnecting...'}
      </div>

      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <main className={`pt-20 transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;