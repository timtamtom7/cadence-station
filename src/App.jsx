import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SessionProvider } from './context/SessionContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { Landing } from './pages/Landing';
import { AppDashboard } from './pages/AppDashboard';
import { Session } from './pages/Session';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Pricing } from './pages/Pricing';
import './styles/global.css';

export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SubscriptionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={<AppDashboard />} />
              <Route path="/app/session/new" element={<Session />} />
              <Route path="/app/session/:id" element={<Session />} />
              <Route path="/app/history" element={<History />} />
              <Route path="/app/settings" element={<Settings />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SubscriptionProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
