import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import VehiclePage from './pages/VehiclePage';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import HistoryPage from './pages/HistoryPage';
import FavoritesPage from './pages/FavoritesPage';
import PricingPage from './pages/PricingPage';
import AccountPage from './pages/AccountPage';
import QuickSearchPage from './pages/QuickSearchPage';
import PaymentSuccess from './pages/PaymentSuccess';
import './index.css';

function AppRouter() {
  const location = useLocation();

  // CRITICAL: Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  // Quick search has no navbar/bottom nav
  if (location.pathname === '/quick-search') {
    return <QuickSearchPage />;
  }

  return (
    <>
      <Navbar />
      <BottomNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vehicle/:plate" element={<VehiclePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
