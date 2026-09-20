/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './lib/theme';
import { AppStateProvider } from './lib/store';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { WeatherRisk } from './pages/WeatherRisk';
import { NewsSafety } from './pages/NewsSafety';
import { Routes as RoutesPage } from './pages/Routes';
import { Facilities } from './pages/Facilities';
import { LogisticsTeam } from './pages/LogisticsTeam';
import { Assessment } from './pages/Assessment';
import { AIPriority } from './pages/AIPriority';
import { CommandCenter } from './pages/CommandCenter';
import { HospitalMatching } from './pages/HospitalMatching';
import React from 'react';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AppStateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="weather-risk" element={<WeatherRisk />} />
              <Route path="news-safety" element={<NewsSafety />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="facilities" element={<Facilities />} />
              <Route path="hospital-matching" element={<HospitalMatching />} />
              <Route path="logistics" element={<LogisticsTeam />} />
              <Route path="assessment" element={<Assessment />} />
              <Route path="ai-priority" element={<AIPriority />} />
              <Route path="command-center" element={<CommandCenter />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppStateProvider>
    </ThemeProvider>
  );
}

