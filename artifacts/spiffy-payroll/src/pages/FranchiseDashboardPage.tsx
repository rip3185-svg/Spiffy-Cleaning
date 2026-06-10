import React, { useState } from 'react';
import { FRANCHISES, FRANCHISE_MONTHS, FranchiseLocation } from '@/data/franchises';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { X, User } from 'lucide-react';
import { toast } from 'sonner';

export default function FranchiseDashboardPage() {
  const [selectedFranchise, setSelectedFranchise] = useState<FranchiseLocation | null>(null);

  const totalRevenue = FRANCHISES.reduce((sum, f) => sum + f.ytdRevenue, 0);
  const totalJobs = FRANCHISES.reduce((sum, f) => sum + f.monthlyJobs[f.monthlyJobs.length - 1], 0);
  const weightedCollection = FRANCHISES.reduce((sum, f) => sum + (f.collectionRate * f.ytdRevenue), 0) / totalRevenue;

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Franchise Network</h1>
        <p className="text-white/50 text-sm mt-0.5">{FRANCHISES.length} locations across Michigan</p>
      </div>

      {/* Network Health Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-xs text-gray-500 font-medium mb-1">Total Network Revenue</div>
          <div className="text-xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-xs text-gray-500 font-medium mb-1">Avg Collection Rate</div>
          <div className="text-xl font-bold text-blue-600">{weightedCollection.toFixed(1)}%</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-xs text-gray-500 font-medium mb-1">Network Jobs This Month</div>
          <div className="text-xl font-bold text-[#0D1B4E]">{totalJobs.toLocaleString()}</div>
        </div>
      </div>

      {/* Franchise Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FRANCHISES.map(f => {
          const sparklineData = f.monthlyRevenue.map((val, idx) => ({ month: FRANCHISE_MONTHS[idx], value: val }));
          const isPositiveGrowth = f.ytdGrowth >= 0;
          
          let statusColor = '';
          let statusLabel = '';
          let strokeColor = '';
          let fillClass = '';
          
          if (f.status === 'active') {
            statusColor = 'bg-green-100 text-green-700';
            statusLabel = 'Active';
            strokeColor = '#16A34A';
            fillClass = 'text-green-100';
          } else if (f.status === 'onboarding') {
            statusColor = 'bg-blue-100 text-blue-700';
            statusLabel = 'Growing';
            strokeColor = '#1DC8FF';
            fillClass = 'text-blue-100';
          } else {
            statusColor = 'bg-red-100 text-red-700';
            statusLabel = 'Needs Attention';
            strokeColor = '#DC2626';
            fillClass = 'text-red-100';
          }

          return (
            <div 
              key={f.id} 
              onClick={() => setSelectedFranchise(f)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-lg text-[#0D1B4E]">{f.name}</div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                  {statusLabel}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <User size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">{f.owner}</span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-400">{f.city}, {f.state}</span>
              </div>

              {/* Sparkline */}
              <div className="h-16 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <Tooltip 
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label: any) => label}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={strokeColor} 
                      fill={strokeColor} 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Metric Pills */}
              <div className="flex gap-2 mb-4">
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-center flex-1">
                  <div className="font-semibold text-[#0D1B4E]">${f.ytdRevenue.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">YTD Rev</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-center flex-1">
                  <div className={`font-semibold ${f.collectionRate >= 90 ? 'text-green-600' : f.collectionRate >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {f.collectionRate}%
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Collection</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-center flex-1">
                  <div className={`font-semibold ${f.outstandingAR > 20000 ? 'text-red-600' : 'text-gray-700'}`}>
                    ${(f.outstandingAR / 1000).toFixed(1)}k
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Outst. AR</div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {f.employeeCount} employees · {f.clientCount} clients
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-semibold ${isPositiveGrowth ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {isPositiveGrowth ? '+' : ''}{f.ytdGrowth}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedFranchise && (
          <React.Fragment>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelectedFranchise(null)}
            />
            <motion.div
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#0D1B4E]">{selectedFranchise.name}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedFranchise.owner} · {selectedFranchise.phone} · Since {new Date(selectedFranchise.startDate).getFullYear()}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFranchise(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Chart section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">6 Month Performance</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedFranchise.monthlyRevenue.map((val, idx) => ({ 
                        month: FRANCHISE_MONTHS[idx], 
                        revenue: val,
                        jobs: selectedFranchise.monthlyJobs[idx]
                      }))}>
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                        <YAxis yAxisId="left" tickFormatter={(val) => `$${val/1000}k`} tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                        <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                        <Tooltip formatter={(value: any, name: string) => [name === 'revenue' ? `$${value.toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Jobs']} />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#1DC8FF" fill="rgba(29,200,255,0.1)" strokeWidth={2} />
                        <Area yAxisId="right" type="monotone" dataKey="jobs" stroke="#0D1B4E" fill="none" strokeWidth={2} strokeOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">YTD Revenue</div>
                    <div className="text-xl font-bold text-[#0D1B4E]">${selectedFranchise.ytdRevenue.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">YTD Growth</div>
                    <div className={`text-xl font-bold ${selectedFranchise.ytdGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedFranchise.ytdGrowth >= 0 ? '+' : ''}{selectedFranchise.ytdGrowth}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Avg Job Value</div>
                    <div className="text-xl font-bold text-[#0D1B4E]">${selectedFranchise.avgJobValue}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Collection Rate</div>
                    <div className="text-xl font-bold text-[#0D1B4E]">{selectedFranchise.collectionRate}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">AR Outstanding</div>
                    <div className="text-xl font-bold text-[#0D1B4E]">${selectedFranchise.outstandingAR.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Last Payroll</div>
                    <div className="text-xl font-bold text-[#0D1B4E]">${selectedFranchise.lastPayrollTotal.toLocaleString()}</div>
                  </div>
                </div>

                {/* Top Clients */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Clients</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFranchise.topClients.map((client, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {client}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedFranchise.notes && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 px-4 py-3 rounded-r-lg">
                    <p className="italic text-gray-700 text-sm">{selectedFranchise.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                <button 
                  onClick={() => toast.success(`Opening contact for ${selectedFranchise.owner}...`)}
                  className="flex-1 bg-white border border-gray-200 text-[#0D1B4E] font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Contact Owner
                </button>
                <button 
                  onClick={() => toast.success('Full report coming soon!')}
                  className="flex-1 bg-[#0D1B4E] text-white font-semibold py-3 rounded-lg hover:bg-[#1DC8FF] hover:text-[#0D1B4E] transition-colors"
                >
                  View Full Report
                </button>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}