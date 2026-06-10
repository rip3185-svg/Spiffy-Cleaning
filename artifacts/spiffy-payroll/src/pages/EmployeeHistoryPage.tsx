import React, { useState, useEffect } from 'react';
import { getSession } from '@/utils/auth';
import { getWeekSummaries } from '@/utils/storage';
import type { WeekSummary } from '@/types';
import { Lock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function EmployeeHistoryPage() {
  const user = getSession();
  const [summaries, setSummaries] = useState<WeekSummary[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const all = getWeekSummaries();
      setSummaries(all.filter(s => s.employeeId === user.id).sort((a, b) => b.weekStart.localeCompare(a.weekStart)));
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-white mb-1">Pay History</h1>
      <p className="text-white/50 text-sm mb-6">Your approved &amp; locked weeks</p>
      
      {summaries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h3 className="text-lg font-medium text-[#1A1A2A] mb-2">No past weeks yet</h3>
          <p className="text-gray-500">Your approved and locked weeks will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => {
            const isExpanded = expandedWeek === summary.weekStart;
            const weekEndDate = new Date(summary.weekStart);
            weekEndDate.setDate(weekEndDate.getDate() + 6);
            
            return (
              <div key={summary.weekStart} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedWeek(isExpanded ? null : summary.weekStart)}
                >
                  <div>
                    <div className="font-semibold text-[#1A1A2A]">
                      {format(parseISO(summary.weekStart), 'MMM d')} – {format(weekEndDate, 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <span className="font-bold text-[#0D1B4E] text-lg">${summary.totalPay.toFixed(2)}</span>
                      <span className="text-gray-300">•</span>
                      {summary.status === 'locked' ? (
                        <span className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          <Lock size={12} className="mr-1" /> Locked
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                          <CheckCircle size={12} className="mr-1" /> Approved
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 text-sm">
                    <p className="text-gray-600 mb-2">Summary Details</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Jobs Pay</span>
                        <span className="font-medium">${summary.totalPay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Drive Pay</span>
                        <span className="font-medium">${summary.drivePay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Deductions</span>
                        <span className="font-medium text-red-500">-${summary.deductions.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-[#0D1B4E]">
                        <span>Total Paid</span>
                        <span>${(summary.totalPay + summary.drivePay - summary.deductions).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}