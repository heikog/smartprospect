import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { ProspectPreviewPage } from './pages/ProspectPreviewPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? <Dashboard /> : <LandingPage onLogin={() => setIsLoggedIn(true)} />
        }
      />
      <Route path="/preview/:campaignId/:prospectId" element={<ProspectPreviewPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

