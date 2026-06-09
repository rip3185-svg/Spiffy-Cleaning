import type { User } from '../types';

export const EMPLOYEES: User[] = [
  { id: 'alejandro', email: 'alejandro@spiffy.com', name: 'Alejandro', role: 'employee', password: 'spiffy2026' },
  { id: 'gissell', email: 'gissell@spiffy.com', name: 'Gissell Lilieth López', role: 'employee', password: 'spiffy2026' },
  { id: 'jesenia', email: 'jesenia@spiffy.com', name: 'Jesenia Fernandez', role: 'employee', password: 'spiffy2026' },
  { id: 'linda', email: 'linda@spiffy.com', name: 'Linda Rivera', role: 'employee', password: 'spiffy2026' },
  { id: 'oneyda', email: 'oneyda@spiffy.com', name: 'Oneyda', role: 'employee', password: 'spiffy2026' },
  { id: 'sugeydi', email: 'sugeydi@spiffy.com', name: 'Sugeydi Rivera', role: 'employee', password: 'spiffy2026' },
  { id: 'sujeydi', email: 'sujeydi@spiffy.com', name: 'Sujeydi Jarquin', role: 'employee', password: 'spiffy2026' },
  { id: 'dexter', email: 'dexter@spiffy.com', name: 'Dexter Thomas', role: 'manager', password: 'spiffy2026' },
  { id: 'admin', email: 'admin@spiffy.com', name: 'Dexter Thomas', role: 'admin', password: 'spiffy2026' },
];

export const TEAM_MEMBERS = EMPLOYEES.filter(e => e.role === 'employee');
export const ALL_USERS = EMPLOYEES;
