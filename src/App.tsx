import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import GuestEntry from './pages/GuestEntry';
import Home from './pages/Home';
import Jaap from './pages/Jaap';
import Donate from './pages/Donate';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useApp();
  if (loading) return <div className="flex h-screen items-center justify-center bg-orange-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div></div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, adminUser, loading } = useApp();
  if (loading) return <div className="flex h-screen items-center justify-center bg-orange-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div></div>;
  if (!user || user.role !== 'admin' || !adminUser) return <Navigate to="/home" />;
  return <>{children}</>;
};

function AppRoutes() {
  const { user, loading } = useApp();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-orange-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div></div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" /> : <GuestEntry />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/jaap" element={<Jaap />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-center" />
      </Router>
    </AppProvider>
  );
}
