import React, { useState, useEffect } from 'react';
import { DEMO_WEEK } from '@/data/demoWeek';
import { TEAM_MEMBERS } from '@/data/employees';
import { getJobs } from '@/utils/storage';
import { calculatePay } from '@/utils/payCalc';
import type { JobEntry } from '@/types';
import { useLang } from '@/i18n/LanguageContext';

export default function ManagerDashboardPage() {
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const { t } = useLang();

  useEffect(() => {
    setJobs(getJobs().filter(j => j.weekStart === DEMO_WEEK));
  }, []);

  let totalPayroll = 0;
  const employeeData = TEAM_MEMBERS.map(emp => {
    const empJobs = jobs.filter(j => j.employeeId === emp.id);
    let pay = 0;
    empJobs.forEach(j => {
      const pr = calculatePay(j);
      if (pr) pay += pr.myPay;
    });
    totalPayroll += pay;
    return {
      name: emp.name,
      jobCount: empJobs.length,
      approvedCount: empJobs.filter(j => j.status === 'approved').length,
      pendingCount: empJobs.filter(j => j.status === 'pending').length,
      totalPay: pay
    };
  }).filter(e => e.jobCount > 0).sort((a, b) => b.totalPay - a.totalPay);

  const propertyDataMap: Record<string, { jobs: number, laborCost: number }> = {};
  jobs.forEach(j => {
    if (!j.property) return;
    if (!propertyDataMap[j.property]) propertyDataMap[j.property] = { jobs: 0, laborCost: 0 };
    propertyDataMap[j.property].jobs += 1;
    const pr = calculatePay(j);
    if (pr) propertyDataMap[j.property].laborCost += pr.rowTotal;
  });

  const propertyData = Object.entries(propertyDataMap).map(([prop, data]) => ({
    property: prop,
    jobs: data.jobs,
    laborCost: data.laborCost,
    percent: (data.laborCost / (Object.values(propertyDataMap).reduce((s, d) => s + d.laborCost, 0) || 1)) * 100
  })).sort((a, b) => b.laborCost - a.laborCost);

  const topProperty = propertyData.length > 0 ? propertyData[0].property : 'None';
  const totalJobs = jobs.length;
  const unapprovedCount = jobs.filter(j => j.status === 'pending').length;

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{t.dashboard.title}</h1>
        <p className="text-white/50 text-sm mt-0.5">{t.dashboard.weekOf}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1">{t.dashboard.totalPayroll}</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">${totalPayroll.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1">{t.dashboard.unapproved}</div>
          <div className="text-2xl font-bold text-yellow-600">{unapprovedCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1">{t.dashboard.totalJobs}</div>
          <div className="text-2xl font-bold text-[#0D1B4E]">{totalJobs}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1">{t.dashboard.topProperty}</div>
          <div className="text-lg font-bold text-[#0D1B4E] truncate" title={topProperty}>{topProperty}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-[#0D1B4E]">
            {t.dashboard.payrollByEmp}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="p-3 font-medium">{t.dashboard.name}</th>
                  <th className="p-3 font-medium text-center">{t.dashboard.jobs}</th>
                  <th className="p-3 font-medium text-center">{t.dashboard.status}</th>
                  <th className="p-3 font-medium text-right">{t.dashboard.totalPay}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employeeData.map((emp, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-[#1A1A2A]">{emp.name}</td>
                    <td className="p-3 text-center">{emp.jobCount}</td>
                    <td className="p-3 text-center">
                      {emp.pendingCount > 0 ? (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{t.dashboard.pending}</span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{t.dashboard.approved}</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold">${emp.totalPay.toFixed(2)}</td>
                  </tr>
                ))}
                {employeeData.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">{t.dashboard.noData}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-[#0D1B4E]">
            {t.dashboard.laborByProp}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="p-3 font-medium">{t.dashboard.property}</th>
                  <th className="p-3 font-medium text-center">{t.dashboard.jobs}</th>
                  <th className="p-3 font-medium text-right">{t.dashboard.laborCost}</th>
                  <th className="p-3 font-medium text-right">{t.dashboard.pct}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {propertyData.slice(0, 10).map((prop, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-[#1A1A2A] truncate max-w-[150px]">{prop.property}</td>
                    <td className="p-3 text-center">{prop.jobs}</td>
                    <td className="p-3 text-right font-semibold">${prop.laborCost.toFixed(2)}</td>
                    <td className="p-3 text-right text-gray-500">{prop.percent.toFixed(1)}%</td>
                  </tr>
                ))}
                {propertyData.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">{t.dashboard.noData}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
