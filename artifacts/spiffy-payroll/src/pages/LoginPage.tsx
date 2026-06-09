import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { getSession, login, loginById } from '@/utils/auth';
import { ALL_USERS, TEAM_MEMBERS } from '@/data/employees';
import logoPath from '@assets/spiffy_cleaning_logo_transparent.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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
    const user = loginById(id);
    if (user) {
      if (user.role === 'manager' || user.role === 'admin') {
        setLocation('/manager/overview');
      } else {
        setLocation('/employee/week');
      }
    }
  };

  const dexter = ALL_USERS.find(u => u.id === 'dexter');

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 mb-8">
        <img src={logoPath} alt="Spiffy Cleaning" className="h-20 w-auto mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-[#0D1B4E] text-center mb-6">Payroll Tracker</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[48px] text-lg bg-gray-50 border-gray-200"
              data-testid="input-email"
            />
          </div>
          
          <div className="relative">
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-[48px] text-lg bg-gray-50 border-gray-200 pr-12"
              data-testid="input-password"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          
          <Button 
            type="submit" 
            className="w-full bg-[#0D1B4E] text-white hover:bg-[#1DC8FF] hover:text-[#0D1B4E] min-h-[48px] text-lg rounded-lg"
            data-testid="button-login"
          >
            Sign In
          </Button>
        </form>
      </div>

      <div className="w-full max-w-sm">
        <h2 className="text-[#0D1B4E] font-semibold text-lg mb-3">Select Your Account</h2>
        
        {dexter && (
          <button 
            onClick={() => handleTileLogin(dexter.id)}
            className="w-full bg-[#0D1B4E] text-white rounded-xl min-h-[56px] flex items-center px-4 mb-3 hover:bg-[#0D1B4E]/90 transition-colors"
            data-testid="tile-login-dexter"
          >
            <div className="flex-1 text-left font-medium text-lg">{dexter.name}</div>
            <div className="text-xs bg-white/20 px-2 py-1 rounded">Owner</div>
          </button>
        )}
        
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
          {TEAM_MEMBERS.map(emp => (
            <button 
              key={emp.id}
              onClick={() => handleTileLogin(emp.id)}
              className="bg-white border border-gray-200 text-[#0D1B4E] rounded-xl min-h-[56px] flex flex-col justify-center px-4 hover:bg-blue-50 transition-colors shadow-sm text-left"
              data-testid={`tile-login-${emp.id}`}
            >
              <div className="font-medium truncate">{emp.name}</div>
              <div className="text-xs text-gray-500">Team Member</div>
            </button>
          ))}
        </div>
      </div>
      
      <p className="text-gray-400 text-xs text-center mt-8">
        Demo Mode — Data saved in your browser
      </p>
    </div>
  );
}
