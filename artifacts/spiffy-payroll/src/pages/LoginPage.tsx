import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { login, loginById } from '@/utils/auth';
import { ALL_USERS, TEAM_MEMBERS } from '@/data/employees';
import logoPath from '@assets/spiffy_cleaning_logo_transparent.png';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const user = login(email, password);
    if (user) {
      if (user.role === 'manager' || user.role === 'admin') {
        setLocation('/manager/overview');
      } else {
        setLocation('/employee/week');
      }
    } else {
      setError("Hmm, that email or password doesn't look right.");
    }
  };

  const handleTileLogin = (id: string) => {
    setLoadingId(id);
    setTimeout(() => {
      const user = loginById(id);
      if (user) {
        if (user.role === 'manager' || user.role === 'admin') {
          setLocation('/manager/overview');
        } else {
          setLocation('/employee/week');
        }
      }
      setLoadingId(null);
    }, 180);
  };

  const dexter = ALL_USERS.find(u => u.id === 'dexter');

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #0D1B4E 0%, #132260 40%, #1a3080 60%, #F9FAFB 60%)' }}
    >
      {/* Login Card */}
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(13,27,78,0.45)] mb-8">
        {/* Navy hero top with big logo */}
        <div
          className="flex flex-col items-center justify-center px-8 pt-10 pb-8"
          style={{ background: 'linear-gradient(160deg, #0D1B4E 0%, #1a3282 100%)' }}
        >
          <img
            src={logoPath}
            alt="Spiffy Cleaning"
            className="w-48 h-auto drop-shadow-[0_4px_16px_rgba(29,200,255,0.35)] mb-4"
            style={{ filter: 'drop-shadow(0 4px 16px rgba(29,200,255,0.3)) brightness(1.05)' }}
          />
          <div className="h-px w-24 mb-3" style={{ background: 'linear-gradient(90deg, transparent, #1DC8FF, transparent)' }} />
          <span className="text-white/70 text-sm font-medium tracking-widest uppercase">Payroll Tracker</span>
        </div>

        {/* White form section */}
        <div className="bg-white px-8 pt-7 pb-8">
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base bg-gray-50 border-gray-200 focus:border-[#1DC8FF] focus:ring-[#1DC8FF]/20 rounded-xl"
              data-testid="input-email"
            />
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base bg-gray-50 border-gray-200 focus:border-[#1DC8FF] focus:ring-[#1DC8FF]/20 rounded-xl pr-12"
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D1B4E] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-xl font-semibold text-base text-white transition-all duration-150 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #0D1B4E 0%, #1a3282 100%)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #1DC8FF 0%, #00aaee 100%)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #0D1B4E 0%, #1a3282 100%)')}
              data-testid="button-login"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>

      {/* Quick Access section */}
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-white/20" />
          <span className="text-white/80 font-semibold text-sm tracking-wide uppercase">Quick Access</span>
          <div className="h-px flex-1 bg-white/20" />
        </div>

        {dexter && (
          <button
            onClick={() => handleTileLogin(dexter.id)}
            disabled={loadingId === dexter.id}
            className="w-full group relative overflow-hidden rounded-2xl mb-3 text-left transition-all duration-200 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #1DC8FF 0%, #00aaee 100%)', boxShadow: '0 4px 20px rgba(29,200,255,0.4)' }}
            data-testid="tile-login-dexter"
          >
            <div className="flex items-center px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-lg mr-4 shrink-0">
                {dexter.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#0D1B4E] text-base leading-tight">{dexter.name}</div>
                <div className="text-[#0D1B4E]/70 text-xs font-medium">Owner · All access</div>
              </div>
              <ChevronRight size={20} className="text-[#0D1B4E]/60 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          {TEAM_MEMBERS.map(emp => (
            <button
              key={emp.id}
              onClick={() => handleTileLogin(emp.id)}
              disabled={loadingId === emp.id}
              className="group relative bg-white/95 backdrop-blur rounded-2xl text-left transition-all duration-150 hover:shadow-[0_8px_24px_rgba(13,27,78,0.2)] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 overflow-hidden"
              style={{ boxShadow: '0 2px 8px rgba(13,27,78,0.12)' }}
              data-testid={`tile-login-${emp.id}`}
            >
              <div className="px-4 py-3.5">
                <div className="w-8 h-8 rounded-full bg-[#0D1B4E]/10 flex items-center justify-center font-bold text-[#0D1B4E] text-sm mb-2">
                  {emp.name.charAt(0)}
                </div>
                <div className="font-semibold text-[#0D1B4E] text-sm leading-tight truncate">{emp.name.split(' ')[0]}</div>
                <div className="text-gray-400 text-xs mt-0.5">Team Member</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1DC8FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </button>
          ))}
        </div>

        <p className="text-white/40 text-xs text-center mt-6">
          Demo Mode — Data saved in your browser
        </p>
      </div>
    </div>
  );
}
