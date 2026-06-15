import React, { useState, useEffect } from 'react';
import { DEMO_WEEK } from '@/data/demoWeek';
import { TEAM_MEMBERS } from '@/data/employees';
import { getJobs } from '@/utils/storage';
import { calculatePay } from '@/utils/payCalc';
import { exportManagerPayrollPDF } from '@/utils/pdfExport';
import { WEEKLY_DRIVE_PAY } from '@/data/payRates';
import { FileDown, DollarSign, AlertCircle, Briefcase, MapPin } from 'lucide-react';
import type { JobEntry } from '@/types';
import { useLang } from '@/i18n/LanguageContext';
import { toast } from 'sonner';

export default function ManagerDashboardPage() {
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const { t, lang } = useLang();

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

  const handleExportPDF = () => {
    toast.success(t.pdf.generating);
    const rows = employeeData.map(e => ({
      name: e.name,
      jobs: e.jobCount,
      pending: e.pendingCount,
      jobsPay: e.totalPay,
      drivePay: WEEKLY_DRIVE_PAY,
      total: e.totalPay + WEEKLY_DRIVE_PAY,
    }));
    exportManagerPayrollPDF(t.dashboard.weekOf, rows, lang as 'en' | 'es');
  };

  return (
    <div className="pb-24">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.dashboard.title}</h1>
          <p className="text-white/50 text-sm mt-0.5">{t.dashboard.weekOf}</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-[#0D1B4E] transition-all"
          style={{ background: 'linear-gradient(135deg, #1DC8FF, #00b8f0)', boxShadow: '0 4px 12px rgba(29,200,255,0.3)' }}
        >
          <FileDown size={16} />
          {t.pdf.downloadPayroll}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total Payroll */}
        <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B4E 0%, #1a3282 100%)', border: '1px solid rgba(29,200,255,0.25)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider">{t.dashboard.totalPayroll}</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(29,200,255,0.15)' }}>
              <DollarSign size={15} className="text-[#1DC8FF]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">${totalPayroll.toFixed(2)}</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #1DC8FF, transparent)' }} />
        </div>

        {/* Unapproved */}
        <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: unapprovedCount > 0 ? 'linear-gradient(135deg, #7c3a00 0%, #92400e 100%)' : 'linear-gradient(135deg, #0D1B4E 0%, #1a3282 100%)', border: `1px solid ${unapprovedCount > 0 ? 'rgba(251,191,36,0.35)' : 'rgba(29,200,255,0.25)'}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider">{t.dashboard.unapproved}</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: unapprovedCount > 0 ? 'rgba(251,191,36,0.2)' : 'rgba(29,200,255,0.15)' }}>
              <AlertCircle size={15} className={unapprovedCount > 0 ? 'text-yellow-400' : 'text-[#1DC8FF]'} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${unapprovedCount > 0 ? 'text-yellow-400' : 'text-white'}`}>{unapprovedCount}</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: unapprovedCount > 0 ? 'linear-gradient(90deg, transparent, #fbbf24, transparent)' : 'linear-gradient(90deg, transparent, #1DC8FF, transparent)' }} />
        </div>

        {/* Total Jobs */}
        <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B4E 0%, #1a3282 100%)', border: '1px solid rgba(29,200,255,0.25)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider">{t.dashboard.totalJobs}</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(29,200,255,0.15)' }}>
              <Briefcase size={15} className="text-[#1DC8FF]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{totalJobs}</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #1DC8FF, transparent)' }} />
        </div>

        {/* Top Property */}
        <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B4E 0%, #1a3282 100%)', border: '1px solid rgba(29,200,255,0.25)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider">{t.dashboard.topProperty}</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(29,200,255,0.15)' }}>
              <MapPin size={15} className="text-[#1DC8FF]" />
            </div>
          </div>
          <div className="text-base font-bold text-white truncate leading-tight" title={topProperty}>{topProperty}</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #1DC8FF, transparent)' }} />
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
                  <th className="p-3 font-medium text-right w-24">{t.dashboard.pct}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {propertyData.slice(0, 10).map((prop, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-[#1A1A2A] truncate max-w-[150px]">{prop.property}</td>
                    <td className="p-3 text-center">{prop.jobs}</td>
                    <td className="p-3 text-right font-semibold">${prop.laborCost.toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${prop.percent}%`, background: 'linear-gradient(90deg, #1DC8FF, #0D1B4E)' }}
                          />
                        </div>
                        <span className="text-gray-500 text-xs w-8 text-right">{prop.percent.toFixed(0)}%</span>
                      </div>
                    </td>
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
