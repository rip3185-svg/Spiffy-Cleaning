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
      {pendingJobs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center text-red-700 font-semibold gap-2">
            <AlertCircle size={20} />
            <span>{pendingJobs.length} job entries need your approval</span>
          </div>
          <Link href={`/manager/employee/${pendingJobs[0].employeeId}`} className="text-red-600 font-medium underline text-sm">
            Review Now
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Total Payroll</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">${totalPayroll.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">{totalEmployeesWithJobs} employees this week</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Needs Review</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">{pendingJobs.length}</div>
          <div className="text-xs text-yellow-600 mt-1 font-medium">Pending entries</div>
        </div>
        
        <Link href="/manager/collections">
          <div className="bg-red-600 rounded-xl shadow-sm p-4 cursor-pointer hover:bg-red-700 transition-colors h-full flex flex-col justify-center">
            <div className="text-white/80 text-sm font-medium mb-1">Collections</div>
            <div className="text-2xl font-bold text-white">${totalPastDue.toLocaleString()}</div>
            <div className="text-xs text-red-200 mt-1">{pastDueInvoices.length} past due invoices</div>
          </div>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Approved</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">{fullyApprovedCount} <span className="text-lg text-gray-400 font-normal">/ {totalEmployeesWithJobs}</span></div>
          <div className="text-xs text-gray-400 mt-1">Complete</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-lg shadow-sm">
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ChevronLeft size={20} /></button>
        <h2 className="font-semibold text-[#0D1B4E] text-lg">Week of Jun 2–8, 2026</h2>
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ChevronRight size={20} /></button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {employeeStats.map((emp, idx) => (
          <div key={emp.id} className={`flex items-center p-4 border-b border-gray-100 last:border-0 ${emp.status === 'red' ? 'bg-red-50/30' : ''}`}>
            <div className={`w-3 h-3 rounded-full mr-4 shrink-0 ${
              emp.status === 'red' ? 'bg-red-500' : 
              emp.status === 'green' ? 'bg-green-500' : 
              emp.status === 'yellow' ? 'bg-yellow-500' : 'bg-gray-300'
            }`} />
            
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[#1A1A2A] truncate">{emp.name}</div>
              <div className="text-sm text-gray-500 flex gap-2 items-center">
                <span>{emp.jobCount} jobs</span>
                {emp.pendingCount > 0 && (
                  <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded text-xs font-medium">
                    {emp.pendingCount} pending
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right mx-4 hidden sm:block">
              <div className="font-bold text-[#0D1B4E]">${emp.totalPay.toFixed(2)}</div>
            </div>
            
            {emp.jobCount > 0 ? (
              <Link href={`/manager/employee/${emp.id}`}>
                <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  emp.status === 'red' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                  'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}>
                  Review &rarr;
                </button>
              </Link>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-400 italic">No entries yet</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}