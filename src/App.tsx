/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './lib/theme';
import { LanguageProvider } from './lib/i18n';
import { AppStateProvider } from './lib/store';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { WeatherRisk } from './pages/WeatherRisk';
import { NewsSafety } from './pages/NewsSafety';
import { Routes as RoutesPage } from './pages/Routes';
import { Facilities } from './pages/Facilities';
import { LogisticsTeam } from './pages/LogisticsTeam';
import { Assessment } from './pages/Assessment';
import { CommandCenter } from './pages/CommandCenter';
import { HospitalMatching } from './pages/HospitalMatching';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { AuthPortal } from './components/AuthPortal';

const ADMIN_ONLY_PATHS = ['/hospital-matching', '/logistics', '/assessment', '/command-center'];

function ProtectedLayout() {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) return <AuthPortal />;
  if (session.role !== 'ADMIN' && ADMIN_ONLY_PATHS.some(path => location.pathname.startsWith(path))) {
    return <Navigate to="/" replace />;
  }
  return <Layout />;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return session?.role === 'ADMIN' ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <LanguageProvider>
        <AuthProvider>
          <AppStateProvider>
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<ProtectedLayout />}>
                <Route index element={<Home />} />
                <Route path="weather-risk" element={<WeatherRisk />} />
                <Route path="news-safety" element={<NewsSafety />} />
                <Route path="routes" element={<RoutesPage />} />
                <Route path="facilities" element={<Facilities />} />
                <Route path="hospital-matching" element={<AdminOnly><HospitalMatching /></AdminOnly>} />
                <Route path="logistics" element={<AdminOnly><LogisticsTeam /></AdminOnly>} />
                <Route path="assessment" element={<AdminOnly><Assessment /></AdminOnly>} />
                <Route path="command-center" element={<AdminOnly><CommandCenter /></AdminOnly>} />
              </Route>
              </Routes>
            </BrowserRouter>
          </AppStateProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

