import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { getSession, logout, isManager } from '@/utils/auth';
import { BookOpen, CalendarDays, Home, BarChart3, DollarSign, Settings, LogOut, Menu, X, Building2 } from 'lucide-react';
import logoPath from '@assets/spiffy_cleaning_logo_transparent.png';
import { Button } from 'react-day-picker';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const user = getSession();
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth guard
  if (!user) {
    setLocation('/login');
    return null;
  }

  const manager = isManager(user);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const navItems = manager ? [
    { label: 'Overview', path: '/manager/overview', icon: <Home size={20} /> },
    { label: 'Franchises', path: '/manager/franchises', icon: <Building2 size={20} /> },
    { label: 'Dashboard', path: '/manager/dashboard', icon: <BarChart3 size={20} /> },
    { label: 'Collections', path: '/manager/collections', icon: <DollarSign size={20} /> },
    { label: 'Pay Rates', path: '/admin/pay-rates', icon: <Settings size={20} /> },
  ] : [
    { label: 'My Week', path: '/employee/week', icon: <BookOpen size={20} /> },
    { label: 'History', path: '/employee/history', icon: <CalendarDays size={20} /> },
    { label: 'Pay Rates', path: '/admin/pay-rates', icon: <Settings size={20} /> },
  ];

  // For bottom tabs (limit to 4)
  const mobileTabs = manager ? [
    { label: 'Home', path: '/manager/overview', icon: <Home size={24} /> },
    { label: 'Franchises', path: '/manager/franchises', icon: <Building2 size={24} /> },
    { label: 'Team', path: '/manager/overview', icon: <BookOpen size={24} /> }, // route back to overview for team
    { label: 'Stats', path: '/manager/dashboard', icon: <BarChart3 size={24} /> },
    { label: 'Rates', path: '/admin/pay-rates', icon: <Settings size={24} /> },
  ] : [
    { label: 'Home', path: '/employee/week', icon: <Home size={24} /> },
    { label: 'My Week', path: '/employee/week', icon: <BookOpen size={24} /> },
    { label: 'History', path: '/employee/history', icon: <CalendarDays size={24} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[220px] h-full flex-shrink-0" style={{ background: 'linear-gradient(180deg, #0D1B4E 0%, #091540 100%)' }}>
        <div className="p-6">
          <img src={logoPath} alt="Spiffy Cleaning" className="h-16 w-auto mb-6" />
          <div className="h-px bg-[#1DC8FF]/30 mb-4 w-full"/>
          <nav className="space-y-2">
            {navItems.map(item => {
              const isActive = location === item.path || location.startsWith(`${item.path}/`);
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`flex items-center space-x-3 px-4 py-3 cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-[#1DC8FF]/15 text-[#1DC8FF] font-semibold rounded-lg border-l-[3px] border-[#1DC8FF]' 
                      : 'rounded-r-md text-white/80 hover:text-white hover:bg-white/10'
                  }`}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col text-white">
              <span className="font-medium truncate max-w-[120px]">{user.name}</span>
              <span className="text-xs text-[#1DC8FF]">{manager ? 'Manager' : 'Employee'}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors" title="Log Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[#0D1B4E] text-white h-16 flex items-center justify-between px-4 z-10">
          <img src={logoPath} alt="Spiffy" className="h-10 w-auto" />
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2">
            <Menu size={24} />
          </button>
        </header>

        {/* Demo Banner */}
        {showDemoBanner && (
          <div className="bg-[#1DC8FF] text-[#0D1B4E] font-semibold text-sm px-4 py-2 flex justify-between items-center z-10 shrink-0">
            <span>Demo Mode — Showing week of Jun 2–8, 2026 with real Spiffy team and properties</span>
            <button onClick={() => setShowDemoBanner(false)} className="p-1 hover:bg-black/10 rounded">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-[70px] lg:pb-0">
          <div className="max-w-4xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-[#0D1B4E] flex items-center justify-around px-2 z-20 pb-safe">
          {mobileTabs.map((tab, i) => {
            const isActive = location === tab.path || location.startsWith(`${tab.path}/`);
            return (
              <Link key={i} href={tab.path}>
                <div className={`flex flex-col items-center justify-center w-16 h-full space-y-1 cursor-pointer ${
                  isActive ? 'text-[#1DC8FF]' : 'text-white/60'
                }`}>
                  {tab.icon}
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-[280px] bg-[#0D1B4E] h-full flex flex-col shadow-2xl animate-in slide-in-from-left">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <img src={logoPath} alt="Spiffy Cleaning" className="h-10 w-auto" />
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white">
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map(item => {
                const isActive = location === item.path || location.startsWith(`${item.path}/`);
                return (
                  <Link key={item.path} href={item.path}>
                    <div 
                      className={`flex items-center space-x-3 px-4 py-3 rounded-md cursor-pointer ${
                        isActive ? 'bg-white/10 text-[#1DC8FF]' : 'text-white'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-white/10 bg-black/10">
              <div className="flex items-center justify-between text-white mb-4">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-[#1DC8FF]">{manager ? 'Manager' : 'Employee'}</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                <LogOut size={16} className="mr-2" /> Log Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
