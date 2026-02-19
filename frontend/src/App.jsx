// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from '@context/AuthContext';
import { WebSocketProvider } from '@context/WebSocketContext';
import PrivateRoute from '@components/common/PrivateRoute';
import ErrorBoundary from '@components/common/ErrorBoundary';
import Layout from '@components/common/Layout';
import Login from '@pages/Login';
import Dashboard from '@pages/Dashboard';
import Analysis from '@pages/Analysis';
import Reports from '@pages/Reports';
import AuditLogs from '@pages/AuditLogs';
import Settings from '@pages/Settings';
import Upload from '@pages/Upload';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WebSocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="analysis/:symbol" element={<Analysis />} />
              <Route path="reports" element={<Reports />} />
              <Route path="upload" element={<Upload />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </WebSocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;