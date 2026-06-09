import type { JobEntry, WeekSummary } from '../types';
const JOBS_KEY = 'spiffy_jobs';
const WEEKS_KEY = 'spiffy_weeks';

export function getJobs(): JobEntry[] {
  const raw = localStorage.getItem(JOBS_KEY);
  return raw ? JSON.parse(raw) : [];
}
export function saveJobs(jobs: JobEntry[]): void {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}
export function getJobsForEmployee(employeeId: string, weekStart: string): JobEntry[] {
  return getJobs().filter(j => j.employeeId === employeeId && j.weekStart === weekStart);
}
export function addJob(job: JobEntry): void {
  const jobs = getJobs(); jobs.push(job); saveJobs(jobs);
}
export function updateJob(id: string, updates: Partial<JobEntry>): void {
  saveJobs(getJobs().map(j => j.id === id ? { ...j, ...updates } : j));
}
export function deleteJob(id: string): void {
  saveJobs(getJobs().filter(j => j.id !== id));
}
export function getWeekSummaries(): WeekSummary[] {
  const raw = localStorage.getItem(WEEKS_KEY);
  return raw ? JSON.parse(raw) : [];
}
export function getWeekSummary(employeeId: string, weekStart: string): WeekSummary | null {
  return getWeekSummaries().find(w => w.employeeId === employeeId && w.weekStart === weekStart) ?? null;
}
export function saveWeekSummary(summary: WeekSummary): void {
  const summaries = getWeekSummaries().filter(
    w => !(w.employeeId === summary.employeeId && w.weekStart === summary.weekStart)
  );
  summaries.push(summary);
  localStorage.setItem(WEEKS_KEY, JSON.stringify(summaries));
}
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
