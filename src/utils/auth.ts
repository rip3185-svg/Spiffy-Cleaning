import { ALL_USERS } from '../data/employees';
import type { User } from '../types';
const SESSION_KEY = 'spiffy_session';

export function login(email: string, password: string): User | null {
  const user = ALL_USERS.find(u => u.email === email && u.password === password);
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user ?? null;
}

export function loginById(id: string): User | null {
  const user = ALL_USERS.find(u => u.id === id);
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user ?? null;
}

export function getSession(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isManager(user: User | null): boolean {
  return user?.role === 'manager' || user?.role === 'admin';
}
