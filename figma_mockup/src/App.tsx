import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LandingPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return <Dashboard />;
}
