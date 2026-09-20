import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, CloudLightning, ShieldAlert, Map, Building2, Users, 
  ClipboardCheck, RadioTower, Menu, Search, Bell, 
  MapPin, UserCircle, Moon, Sun, X, Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useTranslation } from '@/lib/i18n';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAppState } from '@/lib/store';

const NAV_ITEMS = [
  { key: 'nav.home', defaultName: 'HOME', path: '/', icon: Home },
  { key: 'nav.weather_risk', defaultName: 'WEATHER & RISK', path: '/weather-risk', icon: CloudLightning },
  { key: 'nav.news_safety', defaultName: 'NEWS & SAFETY', path: '/news-safety', icon: ShieldAlert },
  { key: 'nav.routes', defaultName: 'ROUTES', path: '/routes', icon: Map },
  { key: 'nav.facilities', defaultName: 'FACILITIES', path: '/facilities', icon: Building2 },
  { key: 'nav.hospital_matching', defaultName: 'HOSPITAL MATCHING', path: '/hospital-matching', icon: Stethoscope },
  { key: 'nav.logistics', defaultName: 'LOGISTICS & TEAM', path: '/logistics', icon: Users },
  { key: 'nav.assessment', defaultName: 'ASSESSMENT', path: '/assessment', icon: ClipboardCheck },
  { key: 'nav.command_center', defaultName: 'COMMAND CENTER', path: '/command-center', icon: RadioTower, role: 'COMMANDER' },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const { 
    locations, 
    currentLocationId, 
    setCurrentLocationId, 
    notifications, 
    markNotificationRead, 
    candidateMatches,
    hospitalMatches,
    dhmSummary 
  } = useAppState();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingMatchCount = (candidateMatches || []).filter(m => m.status === 'PENDING_REVIEW').length;
  const pendingHospitalMatchCount = (hospitalMatches || []).filter(m => m.status === 'PENDING_HUMAN_REVIEW').length;

  // Simple global search simulation
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // In a real app, this would route to a search page or open a modal.
    // For now, we just clear it to simulate taking action.
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 relative">
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shadow-lg lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <ShieldAlert className="h-6 w-6 text-blue-600 dark:text-blue-500 mr-2" />
          <h1 className="font-bold text-lg tracking-tight uppercase text-slate-900 dark:text-white">SAHAY<span className="text-blue-600 dark:text-blue-500">AK</span></h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
              )}
            >
              <item.icon className={cn("h-5 w-5 mr-3 shrink-0", 
                item.key === 'nav.command_center' && !sidebarOpen ? 'text-red-500/80' : ''
              )} />
              <span className="truncate">{t(item.key, item.defaultName)}</span>
              {item.key === 'nav.weather_risk' && ((dhmSummary?.criticalRiskCount ?? 0) > 0 || (dhmSummary?.highRiskCount ?? 0) > 0) && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                  DHM {(dhmSummary?.criticalRiskCount ?? 0) + (dhmSummary?.highRiskCount ?? 0)}
                </span>
              )}
              {item.key === 'nav.news_safety' && pendingMatchCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white animate-pulse">
                  {pendingMatchCount}
                </span>
              )}
              {item.key === 'nav.hospital_matching' && pendingHospitalMatchCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500 text-white animate-pulse">
                  {pendingHospitalMatchCount}
                </span>
              )}
              {item.role && (
                <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-transparent space-y-3">
          {/* Mobile / Sidebar Language Selector */}
          <LanguageSelector variant="sidebar" />

          <div className="bg-white dark:bg-slate-950 rounded-lg p-3 border border-slate-200 dark:border-slate-800/60 flex items-center shadow-sm dark:shadow-none">
            <RadioTower className="h-8 w-8 text-slate-400 dark:text-slate-500 mr-3 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                {t('nav.system_status', 'System Status')}
              </p>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1.5 animate-pulse"></span>
                {t('nav.operational', 'Operational')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shrink-0 z-30 transition-colors relative">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mr-4 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <form onSubmit={handleSearch} className="hidden sm:flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 w-full max-w-sm focus-within:border-blue-500 dark:focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-blue-500 dark:focus-within:ring-slate-600 transition-all relative">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search', 'Search demo data...')} 
                className="bg-transparent border-none outline-none w-full placeholder:text-slate-500"
              />
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg overflow-hidden z-50">
                  <div className="p-2 text-xs font-bold text-slate-500 uppercase">Demo Search Results</div>
                  <div className="p-3 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">No matches found for "{searchQuery}" in demo data.</div>
                </div>
              )}
            </form>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector in Header */}
            <LanguageSelector variant="header" />

            {/* Location Selector */}
            <div className="hidden md:flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md transition-colors relative">
              <MapPin className="h-4 w-4 mr-2 text-slate-400" />
              <select 
                className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 font-semibold cursor-pointer appearance-none pr-4"
                value={currentLocationId}
                onChange={(e) => setCurrentLocationId(e.target.value)}
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}, {loc.region}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3 relative">
              <button 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {t('common.notifications', 'Notifications')}
                    </span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">
                        {t('common.no_notifications', 'No notifications')}
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={cn("p-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors", !n.read && "bg-blue-50/50 dark:bg-blue-900/10")}
                          onClick={() => markNotificationRead(n.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={cn("text-xs font-bold uppercase tracking-wider", n.type === 'critical' ? 'text-red-600 dark:text-red-400' : n.type === 'warning' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400')}>
                              {n.type}
                            </span>
                            <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{n.title}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{n.desc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center ml-1 sm:ml-2 cursor-pointer hover:opacity-80 transition-opacity">
                <UserCircle className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                <div className="ml-2 hidden lg:block text-left">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">Admin User</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Commander</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
