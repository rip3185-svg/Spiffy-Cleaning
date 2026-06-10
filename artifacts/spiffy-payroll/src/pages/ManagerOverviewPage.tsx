import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { DEMO_WEEK } from '@/data/demoWeek';
import { TEAM_MEMBERS } from '@/data/employees';
import { getJobs } from '@/utils/storage';
import { calculatePay } from '@/utils/payCalc';
import type { JobEntry } from '@/types';
import { INVOICES } from '@/data/invoices';
import { FRANCHISES } from '@/data/franchises';
import { WEEKLY_DRIVE_PAY } from '@/data/payRates';
import {
  AlertCircle, CheckCircle2, Clock, TrendingUp,
  DollarSign, Users, Building2, BarChart3,
  ChevronRight, MapPin, Car, Zap
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ManagerOverviewPage() {
  const [jobs, setJobs] = useState<JobEntry[]>([]);

  useEffect(() => {
    setJobs(getJobs().filter(j => j.weekStart === DEMO_WEEK));
  }, []);

  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const approvedJobs = jobs.filter(j => j.status === 'approved');
  const pastDueInvoices = INVOICES.filter(i => typeof i.daysLate === 'number' && i.daysLate > 0);
  const totalPastDue = pastDueInvoices.reduce((sum, i) => sum + i.amount, 0);
  const urgentInvoices = [...pastDueInvoices].sort((a, b) => Number(b.daysLate) - Number(a.daysLate)).slice(0, 3);

  const employeeStats = TEAM_MEMBERS.map(emp => {
    const empJobs = jobs.filter(j => j.employeeId === emp.id);
    const pendingCount = empJobs.filter(j => j.status === 'pending').length;
    const approvedCount = empJobs.filter(j => j.status === 'approved').length;
    let totalPay = 0;
    empJobs.forEach(j => { const pay = calculatePay(j); if (pay) totalPay += pay.myPay; });
    let status = 'gray';
    if (pendingCount > 0) status = 'red';
    else if (approvedCount > 0 && empJobs.length === approvedCount) status = 'green';
    else if (empJobs.length > 0) status = 'yellow';
    return { ...emp, jobCount: empJobs.length, pendingCount, approvedCount, totalPay, status };
  });

  employeeStats.sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2, gray: 3 };
    const diff = order[a.status as keyof typeof order] - order[b.status as keyof typeof order];
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });

  const totalPayroll = employeeStats.reduce((sum, e) => sum + e.totalPay, 0);
  const totalDrivePay = TEAM_MEMBERS.length * WEEKLY_DRIVE_PAY;
  const grandPayroll = totalPayroll + totalDrivePay;
  const fullyApprovedCount = employeeStats.filter(e => e.status === 'green').length;
  const totalEmployeesWithJobs = employeeStats.filter(e => e.jobCount > 0).length;
  const uniqueProperties = new Set(jobs.map(j => j.property).filter(Boolean)).size;
  const totalJobs = jobs.length;

  const networkRevenue = FRANCHISES.reduce((sum, f) => sum + f.ytdRevenue, 0);
  const activeLocations = FRANCHISES.filter(f => f.status === 'active').length;

  const employeesNeedingApproval = employeeStats.filter(e => e.pendingCount > 0);

  return (
    <div className="pb-28 space-y-6">

      {/* ── HERO GREETING ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(29,200,255,0.08) 100%)', border: '1px solid rgba(29,200,255,0.18)' }}
      >
        <div className="px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[#1DC8FF] text-sm font-semibold mb-1">{getGreeting()}</p>
            <h1 className="text-3xl font-bold text-white leading-tight">Dexter Thomas</h1>
            <p className="text-white/50 text-sm mt-1">Spiffy Cleaning Company · Owner &amp; Founder</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="text-xs text-white/40 bg-white/8 px-2.5 py-1 rounded-full border border-white/10">📅 Jun 2–8, 2026</span>
              <span className="text-xs text-white/40 bg-white/8 px-2.5 py-1 rounded-full border border-white/10">🏢 {activeLocations} Active Locations</span>
              <span className="text-xs text-white/40 bg-white/8 px-2.5 py-1 rounded-full border border-white/10">👥 {TEAM_MEMBERS.length} Team Leaders</span>
            </div>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <div className="text-white/40 text-xs mb-0.5">This Week's Payroll</div>
            <div className="text-[#1DC8FF] font-bold text-3xl">${grandPayroll.toFixed(0)}</div>
            <div className="text-white/30 text-xs mt-0.5">incl. ${totalDrivePay} drive pay</div>
          </div>
        </div>

        {/* Progress strip */}
        <div className="px-6 py-3 border-t flex items-center gap-4 flex-wrap" style={{ borderColor: 'rgba(29,200,255,0.12)', background: 'rgba(0,0,0,0.15)' }}>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <CheckCircle2 size={13} className="text-green-400" />
            <span><span className="text-green-400 font-semibold">{approvedJobs.length}</span> approved</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Clock size={13} className="text-amber-400" />
            <span><span className="text-amber-400 font-semibold">{pendingJobs.length}</span> pending</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <MapPin size={13} className="text-[#1DC8FF]" />
            <span><span className="text-[#1DC8FF] font-semibold">{uniqueProperties}</span> properties this week</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Zap size={13} className="text-purple-400" />
            <span><span className="text-purple-400 font-semibold">{totalJobs}</span> total jobs</span>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card bg-white rounded-2xl p-4 border-l-4 border-[#1DC8FF]" style={{ boxShadow: '0 4px 20px rgba(13,27,78,0.20)' }}>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Total Payroll</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">${grandPayroll.toFixed(0)}</div>
          <div className="text-xs text-gray-400 mt-1">{totalEmployeesWithJobs} of {TEAM_MEMBERS.length} submitted</div>
        </div>

        <div className="stat-card bg-white rounded-2xl p-4 border-l-4 border-amber-400" style={{ boxShadow: '0 4px 20px rgba(13,27,78,0.20)' }}>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Need Approval</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">{pendingJobs.length}</div>
          <div className={`text-xs mt-1 font-semibold ${pendingJobs.length > 0 ? 'text-amber-500' : 'text-green-500'}`}>
            {pendingJobs.length > 0 ? `${employeesNeedingApproval.length} team members` : '✓ All clear'}
          </div>
        </div>

        <Link href="/manager/collections">
          <div className="stat-card rounded-2xl p-4 cursor-pointer h-full flex flex-col justify-center" style={{ background: 'linear-gradient(135deg, #DC2626, #b91c1c)', boxShadow: '0 4px 20px rgba(220,38,38,0.35)' }}>
            <div className="text-xs font-bold text-red-200 uppercase tracking-wide mb-2">Collections</div>
            <div className="text-2xl font-bold text-white">${totalPastDue.toLocaleString()}</div>
            <div className="text-xs text-red-200 mt-1">{pastDueInvoices.length} invoices past due →</div>
          </div>
        </Link>

        <div className="stat-card bg-white rounded-2xl p-4 border-l-4 border-green-500" style={{ boxShadow: '0 4px 20px rgba(13,27,78,0.20)' }}>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Approved</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">{fullyApprovedCount}<span className="text-base text-gray-400 font-normal"> / {totalEmployeesWithJobs}</span></div>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: totalEmployeesWithJobs > 0 ? `${(fullyApprovedCount / totalEmployeesWithJobs) * 100}%` : '0%' }} />
          </div>
        </div>
      </div>

      {/* ── ACTION ITEMS ── */}
      {(employeesNeedingApproval.length > 0 || urgentInvoices.length > 0) && (
        <div>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Action Required</h2>
          <div className="grid lg:grid-cols-2 gap-3">

            {/* Pending approvals */}
            {employeesNeedingApproval.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(13,27,78,0.20)' }}>
                <div className="px-4 py-3 flex items-center gap-2 border-b border-amber-100" style={{ background: 'rgba(251,191,36,0.06)' }}>
                  <Clock size={15} className="text-amber-500" />
                  <span className="text-sm font-bold text-[#0D1B4E]">Pending Approvals</span>
                  <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{pendingJobs.length} jobs</span>
                </div>
                {employeesNeedingApproval.map(emp => (
                  <Link key={emp.id} href={`/manager/employee/${emp.id}`}>
                    <div className="row-interactive flex items-center px-4 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 shrink-0" style={{ background: 'linear-gradient(135deg, #0D1B4E, #1a3282)' }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#1A1A2A] text-sm truncate">{emp.name}</div>
                        <div className="text-xs text-amber-600 font-medium">{emp.pendingCount} job{emp.pendingCount !== 1 ? 's' : ''} waiting</div>
                      </div>
                      <div className="text-xs font-bold text-[#0D1B4E] bg-[#0D1B4E]/6 px-2.5 py-1 rounded-lg">Review →</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Top overdue invoices */}
            {urgentInvoices.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(13,27,78,0.20)' }}>
                <div className="px-4 py-3 flex items-center gap-2 border-b border-red-100" style={{ background: 'rgba(220,38,38,0.04)' }}>
                  <AlertCircle size={15} className="text-red-500" />
                  <span className="text-sm font-bold text-[#0D1B4E]">Oldest Invoices</span>
                  <Link href="/manager/collections" className="ml-auto text-xs text-[#1DC8FF] font-semibold hover:underline">View all →</Link>
                </div>
                {urgentInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1A1A2A] text-sm truncate">{inv.client}</div>
                      <div className="text-xs text-red-500 font-medium">{inv.daysLate} days overdue</div>
                    </div>
                    <div className="font-bold text-red-600 text-sm shrink-0">${inv.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── QUICK ACCESS ── */}
      <div>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Franchises',   sub: `${FRANCHISES.length} locations`,   icon: <Building2 size={20} />,  href: '/manager/franchises',  color: 'from-violet-600 to-purple-700' },
            { label: 'Analytics',    sub: 'Revenue & jobs',                   icon: <BarChart3 size={20} />,  href: '/manager/dashboard',   color: 'from-[#0D1B4E] to-[#1a3282]' },
            { label: 'Collections',  sub: `$${totalPastDue.toLocaleString()}`, icon: <DollarSign size={20} />, href: '/manager/collections', color: 'from-red-600 to-rose-700' },
            { label: 'Pay Rates',    sub: 'Rate reference',                   icon: <TrendingUp size={20} />, href: '/admin/pay-rates',     color: 'from-emerald-600 to-green-700' },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className={`card-hover rounded-2xl p-4 cursor-pointer bg-gradient-to-br ${item.color} text-white`} style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
                <div className="mb-3 opacity-80">{item.icon}</div>
                <div className="font-bold text-sm">{item.label}</div>
                <div className="text-white/60 text-xs mt-0.5">{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── TEAM STATUS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Team This Week</h2>
          <span className="text-xs text-white/30">Jun 2–8, 2026</span>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(13,27,78,0.20)' }}>
          {employeeStats.map(emp => (
            <Link key={emp.id} href={emp.jobCount > 0 ? `/manager/employee/${emp.id}` : '#'}>
              <div className={`row-interactive flex items-center px-5 py-3.5 border-b border-gray-100 last:border-0`}>
                <div className={`w-2 h-2 rounded-full mr-3 shrink-0 ${
                  emp.status === 'red' ? 'bg-amber-400 status-dot-pending' :
                  emp.status === 'green' ? 'bg-green-500' : 'bg-gray-300'
                }`} />

                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[#0D1B4E] text-xs mr-3 shrink-0" style={{ background: 'rgba(13,27,78,0.08)' }}>
                  {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#1A1A2A] text-sm truncate">{emp.name}</div>
                  <div className="text-xs text-gray-400 flex gap-1.5 items-center mt-0.5 flex-wrap">
                    <span>{emp.jobCount} jobs</span>
                    {emp.pendingCount > 0 && (
                      <span className="text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded font-semibold">{emp.pendingCount} pending</span>
                    )}
                    {emp.status === 'green' && (
                      <span className="text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded font-semibold">✓ Approved</span>
                    )}
                    {emp.jobCount === 0 && (
                      <span className="text-gray-400 italic">No entries yet</span>
                    )}
                  </div>
                </div>

                {emp.jobCount > 0 && (
                  <div className="text-right ml-3 shrink-0">
                    <div className="font-bold text-[#0D1B4E] text-sm">${emp.totalPay.toFixed(0)}</div>
                    <div className="text-xs text-gray-400">+ $100 drive</div>
                  </div>
                )}

                {emp.jobCount > 0 && (
                  <ChevronRight size={16} className="text-gray-300 ml-2 shrink-0" />
                )}
              </div>
            </Link>
          ))}

          {/* Drive pay footer */}
          <div className="px-5 py-3 flex items-center justify-between border-t-2 border-gray-100" style={{ background: 'rgba(29,200,255,0.04)' }}>
            <div className="flex items-center gap-2 text-sm text-[#0D1B4E]/60">
              <Car size={14} className="text-[#1DC8FF]" />
              <span>Drive Pay ({TEAM_MEMBERS.length} leaders × $100)</span>
            </div>
            <span className="font-bold text-[#0D1B4E]">${totalDrivePay.toLocaleString()}</span>
          </div>
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(90deg, rgba(13,27,78,0.04), rgba(29,200,255,0.06))' }}>
            <span className="font-bold text-[#0D1B4E]">Total Week Payroll</span>
            <span className="font-bold text-[#0D1B4E] text-lg">${grandPayroll.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── FRANCHISE TEASER ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Franchise Network</h2>
          <Link href="/manager/franchises" className="text-xs text-[#1DC8FF] font-semibold hover:underline">View all →</Link>
        </div>

        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(29,200,255,0.08) 100%)', border: '1px solid rgba(124,58,237,0.25)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.3)' }}>
              <Building2 size={20} className="text-purple-300" />
            </div>
            <div>
              <div className="font-bold text-white">{FRANCHISES.length} Locations · Michigan</div>
              <div className="text-white/50 text-sm">YTD Network Revenue: <span className="text-green-400 font-bold">${networkRevenue.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="flex gap-3">
            {FRANCHISES.map(f => (
              <div key={f.id} className="text-center">
                <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${f.status === 'active' ? 'bg-green-400' : f.status === 'watch' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                <div className="text-white/50 text-xs">{f.city.split(' ')[0]}</div>
              </div>
            ))}
          </div>
          <Link href="/manager/franchises">
            <div className="flex items-center gap-1.5 text-purple-300 text-sm font-semibold hover:text-purple-200 transition-colors">
              Manage <ChevronRight size={14} />
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}
