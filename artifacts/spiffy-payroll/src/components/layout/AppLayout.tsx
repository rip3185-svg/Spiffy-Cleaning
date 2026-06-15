import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { getSession, logout, isManager } from '@/utils/auth';
import { BookOpen, CalendarDays, Home, BarChart3, DollarSign, Settings, LogOut, Menu, X, Building2, Globe } from 'lucide-react';
import logoPath from '@assets/spiffy_cleaning_logo_transparent.png';
import { useLang } from '@/i18n/LanguageContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const user = getSession();
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  if (!user) return null;

  const manager = isManager(user);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const toggleLang = () => setLang(lang === 'en' ? 'es' : 'en');

  const navItems = manager ? [
    { label: t.nav.overview,    path: '/manager/overview',    icon: <Home size={18} /> },
    { label: t.nav.franchises,  path: '/manager/franchises',  icon: <Building2 size={18} /> },
    { label: t.nav.dashboard,   path: '/manager/dashboard',   icon: <BarChart3 size={18} /> },
    { label: t.nav.collections, path: '/manager/collections', icon: <DollarSign size={18} /> },
    { label: t.nav.payRates,    path: '/admin/pay-rates',     icon: <Settings size={18} /> },
  ] : [
    { label: t.nav.myWeek,   path: '/employee/week',    icon: <BookOpen size={18} /> },
    { label: t.nav.history,  path: '/employee/history', icon: <CalendarDays size={18} /> },
    { label: t.nav.payRates, path: '/admin/pay-rates',  icon: <Settings size={18} /> },
  ];

  const mobileTabs = manager ? [
    { label: t.nav.home,       path: '/manager/overview',    icon: <Home size={22} /> },
    { label: t.nav.franchises, path: '/manager/franchises',  icon: <Building2 size={22} /> },
    { label: t.nav.stats,      path: '/manager/dashboard',   icon: <BarChart3 size={22} /> },
    { label: t.nav.money,      path: '/manager/collections', icon: <DollarSign size={22} /> },
    { label: t.nav.rates,      path: '/admin/pay-rates',     icon: <Settings size={22} /> },
  ] : [
    { label: t.nav.myWeek,  path: '/employee/week',    icon: <BookOpen size={22} /> },
    { label: t.nav.history, path: '/employee/history', icon: <CalendarDays size={22} /> },
    { label: t.nav.rates,   path: '/admin/pay-rates',  icon: <Settings size={22} /> },
  ];

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a1640 0%, #0D1B4E 50%, #091538 100%)' }}>

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-[230px] h-full flex-shrink-0 border-r"
        style={{ background: 'linear-gradient(180deg, #0a1640 0%, #0d1b4e 60%, #0a1640 100%)', borderColor: 'rgba(29,200,255,0.12)' }}
      >
        {/* Logo area */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-center bg-white/5 rounded-2xl px-3 py-4 mb-4 border border-white/10">
            <img src={logoPath} alt="Spiffy Cleaning" className="h-20 w-auto drop-shadow-lg" />
          </div>
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(29,200,255,0.5), transparent)' }} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location === item.path || location.startsWith(`${item.path}/`);
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1DC8FF]/20 text-[#1DC8FF] font-semibold border border-[#1DC8FF]/30'
                    : 'text-white/65 hover:text-white hover:bg-white/8 border border-transparent'
                }`}>
                  <span className={isActive ? 'text-[#1DC8FF]' : 'text-white/50'}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1DC8FF]" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Language toggle */}
        <div className="px-4 pb-2">
          <button
            onClick={toggleLang}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white/50 hover:text-white border border-white/10 hover:bg-white/8 transition-all text-xs font-semibold tracking-wide"
          >
            <Globe size={14} />
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#0D1B4E] shrink-0"
              style={{ background: 'linear-gradient(135deg, #1DC8FF, #00aaee)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">{user.name.split(' ')[0]}</div>
              <div className="text-[#1DC8FF]/80 text-xs">{manager ? t.layout.ownerManager : t.layout.teamMember}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title={t.layout.logOut}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Mobile Header */}
        <header
          className="lg:hidden h-14 flex items-center justify-between px-4 shrink-0"
          style={{ background: 'linear-gradient(90deg, #0D1B4E, #1a3282)' }}
        >
          <img src={logoPath} alt="Spiffy" className="h-9 w-auto" />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
            >
              <Globe size={13} />
              {lang === 'en' ? 'ES' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        {/* Demo Banner */}
        {showDemoBanner && (
          <div
            className="flex items-center justify-between px-4 py-2 shrink-0 text-xs font-semibold border-b"
            style={{ background: 'rgba(29,200,255,0.08)', color: '#1DC8FF', borderColor: 'rgba(29,200,255,0.18)' }}
          >
            <span>{t.layout.demoBanner}</span>
            <button
              onClick={() => setShowDemoBanner(false)}
              className="ml-3 p-1 rounded hover:bg-white/10 transition-colors shrink-0 text-white/40 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-[72px] lg:pb-0">
          <div className="max-w-4xl mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Tabs */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] flex items-center z-20"
          style={{ background: 'linear-gradient(180deg, #0D1B4E, #091540)', borderTop: '1px solid rgba(29,200,255,0.15)' }}
        >
          {mobileTabs.map((tab, i) => {
            const isActive = location === tab.path || location.startsWith(`${tab.path}/`);
            return (
              <Link key={i} href={tab.path} className="flex-1">
                <div className={`flex flex-col items-center justify-center h-full py-2 gap-1 transition-all ${
                  isActive ? 'text-[#1DC8FF]' : 'text-white/40 hover:text-white/70'
                }`}>
                  {tab.icon}
                  <span className="text-[9px] font-semibold tracking-wide uppercase">{tab.label}</span>
                  {isActive && <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-[#1DC8FF]" />}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Mobile Slide-out Menu ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div
            className="relative w-[280px] h-full flex flex-col shadow-2xl"
            style={{ background: 'linear-gradient(180deg, #0B1740 0%, #0D1B4E 100%)' }}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <img src={logoPath} alt="Spiffy Cleaning" className="h-10 w-auto" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map(item => {
                const isActive = location === item.path || location.startsWith(`${item.path}/`);
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#1DC8FF]/15 text-[#1DC8FF] border border-[#1DC8FF]/25'
                          : 'text-white/70 hover:text-white hover:bg-white/8 border border-transparent'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#0D1B4E]"
                  style={{ background: 'linear-gradient(135deg, #1DC8FF, #00aaee)' }}
                >
                  {initials}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{user.name}</div>
                  <div className="text-[#1DC8FF]/80 text-xs">{manager ? t.layout.ownerManager : t.layout.teamMember}</div>
                </div>
              </div>
              <button
                onClick={toggleLang}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white/60 hover:text-white border border-white/15 hover:bg-white/8 transition-all text-sm font-medium mb-2"
              >
                <Globe size={15} />
                {lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/70 hover:text-white border border-white/20 hover:bg-white/10 transition-all text-sm font-medium"
              >
                <LogOut size={15} /> {t.layout.logOut}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
