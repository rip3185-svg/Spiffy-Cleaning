import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { DEMO_WEEK } from '@/data/demoWeek';
import { TEAM_MEMBERS } from '@/data/employees';
import { getJobs } from '@/utils/storage';
import { calculatePay } from '@/utils/payCalc';
import type { JobEntry } from '@/types';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { INVOICES } from '@/data/invoices';

export default function ManagerOverviewPage() {
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  
  useEffect(() => {
    setJobs(getJobs().filter(j => j.weekStart === DEMO_WEEK));
  }, []);

  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const pastDueInvoices = INVOICES.filter(i => typeof i.daysLate === 'number' && i.daysLate > 0);
  const totalPastDue = pastDueInvoices.reduce((sum, i) => sum + i.amount, 0);

  // Group by employee
  const employeeStats = TEAM_MEMBERS.map(emp => {
    const empJobs = jobs.filter(j => j.employeeId === emp.id);
    const pendingCount = empJobs.filter(j => j.status === 'pending').length;
    const approvedCount = empJobs.filter(j => j.status === 'approved').length;
    
    let totalPay = 0;
    empJobs.forEach(j => {
      const pay = calculatePay(j);
      if (pay) totalPay += pay.myPay;
    });

    let status = 'gray'; // no jobs
    if (pendingCount > 0) status = 'red';
    else if (approvedCount > 0 && empJobs.length === approvedCount) status = 'green';
    else if (empJobs.length > 0) status = 'yellow'; // has jobs, none pending, but not all approved? shouldn't happen with just 2 states but good to have

    return {
      ...emp,
      jobCount: empJobs.length,
      pendingCount,
      approvedCount,
      totalPay,
      status
    };
  });

  // Sort: red first, then green, then gray
  employeeStats.sort((a, b) => {
    const order = { 'red': 0, 'yellow': 1, 'green': 2, 'gray': 3 };
    if (order[a.status as keyof typeof order] !== order[b.status as keyof typeof order]) {
      return order[a.status as keyof typeof order] - order[b.status as keyof typeof order];
    }
    return a.name.localeCompare(b.name);
  });

  const totalPayroll = employeeStats.reduce((sum, e) => sum + e.totalPay, 0);
  const fullyApprovedCount = employeeStats.filter(e => e.status === 'green').length;
  const totalEmployeesWithJobs = employeeStats.filter(e => e.jobCount > 0).length;

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-white/50 text-sm mt-0.5">Week of Jun 2–8, 2026</p>
      </div>

      {pendingJobs.length > 0 && (
        <div className="bg-red-500/15 border border-red-400/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center text-red-300 font-semibold gap-2">
            <AlertCircle size={20} />
            <span>{pendingJobs.length} job entries need your approval</span>
          </div>
          <Link href={`/manager/employee/${pendingJobs[0].employeeId}`} className="text-red-300 font-medium underline text-sm">
            Review Now
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card bg-white rounded-2xl p-5 border-l-4 border-[#1DC8FF]" style={{ boxShadow: '0 4px 16px rgba(13,27,78,0.10)' }}>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Total Payroll</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">${totalPayroll.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">{totalEmployeesWithJobs} employees this week</div>
        </div>

        <div className="stat-card bg-white rounded-2xl p-5 border-l-4 border-yellow-400" style={{ boxShadow: '0 4px 16px rgba(13,27,78,0.10)' }}>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Needs Review</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">{pendingJobs.length}</div>
          <div className="text-xs text-yellow-600 mt-1 font-semibold">{pendingJobs.length > 0 ? '⚠ Action required' : 'All clear'}</div>
        </div>

        <Link href="/manager/collections">
          <div className="stat-card rounded-2xl p-5 cursor-pointer h-full flex flex-col justify-center" style={{ background: 'linear-gradient(135deg, #DC2626, #b91c1c)', boxShadow: '0 4px 16px rgba(220,38,38,0.30)' }}>
            <div className="text-xs font-semibold text-red-200 uppercase tracking-wide mb-2">Collections</div>
            <div className="text-2xl font-bold text-white">${totalPastDue.toLocaleString()}</div>
            <div className="text-xs text-red-200 mt-1">{pastDueInvoices.length} past due invoices →</div>
          </div>
        </Link>

        <div className="stat-card bg-white rounded-2xl p-5 border-l-4 border-green-500" style={{ boxShadow: '0 4px 16px rgba(13,27,78,0.10)' }}>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Approved</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">{fullyApprovedCount}<span className="text-lg text-gray-400 font-normal"> / {totalEmployeesWithJobs}</span></div>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: totalEmployeesWithJobs > 0 ? `${(fullyApprovedCount/totalEmployeesWithJobs)*100}%` : '0%' }} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 bg-white px-4 py-3 rounded-2xl" style={{ boxShadow: '0 4px 16px rgba(13,27,78,0.08)' }}>
        <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-[#0D1B4E] transition-all"><ChevronLeft size={20} /></button>
        <h2 className="font-bold text-[#0D1B4E]">Week of Jun 2–8, 2026</h2>
        <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-[#0D1B4E] transition-all"><ChevronRight size={20} /></button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 4px 16px rgba(13,27,78,0.08)' }}>
        {employeeStats.map((emp) => (
          <Link key={emp.id} href={emp.jobCount > 0 ? `/manager/employee/${emp.id}` : '#'}>
            <div className={`row-interactive flex items-center px-5 py-4 border-b border-gray-100 last:border-0 ${emp.status === 'red' ? 'bg-red-50/40' : ''}`}>
              <div className={`w-2.5 h-2.5 rounded-full mr-4 shrink-0 ${
                emp.status === 'red' ? 'bg-red-500 status-dot-pending' :
                emp.status === 'green' ? 'bg-green-500' :
                emp.status === 'yellow' ? 'bg-yellow-400' : 'bg-gray-300'
              }`} />

              <div className="w-9 h-9 rounded-full bg-[#0D1B4E]/8 flex items-center justify-center font-bold text-[#0D1B4E] text-sm mr-3 shrink-0">
                {emp.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#1A1A2A] truncate">{emp.name}</div>
                <div className="text-xs text-gray-400 flex gap-2 items-center mt-0.5">
                  <span>{emp.jobCount} jobs</span>
                  {emp.pendingCount > 0 && (
                    <span className="text-red-600 bg-red-100 px-1.5 py-0.5 rounded font-semibold">
                      {emp.pendingCount} pending
                    </span>
                  )}
                  {emp.status === 'green' && (
                    <span className="text-green-600 bg-green-100 px-1.5 py-0.5 rounded font-semibold">Approved</span>
                  )}
                </div>
              </div>

              <div className="text-right mx-4 hidden sm:block">
                <div className="font-bold text-[#0D1B4E] text-base">${emp.totalPay.toFixed(2)}</div>
              </div>

              {emp.jobCount > 0 ? (
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  emp.status === 'red'
                    ? 'bg-red-500 text-white'
                    : 'bg-[#0D1B4E]/8 text-[#0D1B4E]'
                }`}>
                  Review →
                </div>
              ) : (
                <div className="text-xs text-gray-300 italic">No entries</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}