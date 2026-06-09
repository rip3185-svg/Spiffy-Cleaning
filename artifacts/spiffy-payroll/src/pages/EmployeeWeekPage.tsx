import React, { useState, useEffect } from 'react';
import { getSession } from '@/utils/auth';
import { DEMO_WEEK } from '@/data/demoWeek';
import { getJobsForEmployee, addJob, updateJob, deleteJob, generateId } from '@/utils/storage';
import { calculatePay } from '@/utils/payCalc';
import { JOB_TYPE_OPTIONS } from '@/data/payRates';
import { PropertySearch } from '@/components/ui/PropertySearch';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, Clock } from 'lucide-react';
import type { JobEntry, JobStatus } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALL_USERS } from '@/data/employees';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EmployeeWeekPage() {
  const user = getSession();
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [teamLeader, setTeamLeader] = useState<string>(user?.id || '');
  const [teamSize, setTeamSize] = useState<2 | 3 | 4>(3);
  
  useEffect(() => {
    if (user) {
      setJobs(getJobsForEmployee(user.id, DEMO_WEEK));
      const leaderMatch = user.id === 'jesenia' ? 'jesenia' : (user.id === 'alejandro' ? 'alejandro' : user.id);
      setTeamLeader(leaderMatch);
    }
  }, [user]);

  const refreshJobs = () => {
    if (user) setJobs(getJobsForEmployee(user.id, DEMO_WEEK));
  };

  const handleAddJob = (dayOfWeek: number) => {
    if (!user) return;
    const newJob: JobEntry = {
      id: generateId(),
      employeeId: user.id,
      weekStart: DEMO_WEEK,
      dayOfWeek,
      property: '',
      jobType: '',
      quantity: 1,
      teamSize,
      teamLeader,
      isLeader: user.id === teamLeader,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    addJob(newJob);
    refreshJobs();
  };

  const handleUpdateJob = (id: string, updates: Partial<JobEntry>) => {
    updateJob(id, updates);
    refreshJobs();
  };

  const handleDeleteJob = (id: string) => {
    deleteJob(id);
    refreshJobs();
  };

  const handleTeamSizeChange = (size: 2 | 3 | 4) => {
    setTeamSize(size);
    // Update all pending jobs for this week
    jobs.filter(j => j.status === 'pending').forEach(job => {
      updateJob(job.id, { teamSize: size });
    });
    refreshJobs();
  };

  const handleTeamLeaderChange = (leaderId: string) => {
    setTeamLeader(leaderId);
    if (!user) return;
    const isLeader = user.id === leaderId;
    // Update all pending jobs for this week
    jobs.filter(j => j.status === 'pending').forEach(job => {
      updateJob(job.id, { teamLeader: leaderId, isLeader });
    });
    refreshJobs();
  };

  if (!user) return null;

  const totalApprovedPay = jobs
    .filter(j => j.status === 'approved')
    .reduce((sum, j) => {
      const pay = calculatePay(j);
      return sum + (pay?.myPay || 0);
    }, 0);

  // Group jobs by day
  const jobsByDay: Record<number, JobEntry[]> = {};
  jobs.forEach(j => {
    if (!jobsByDay[j.dayOfWeek]) jobsByDay[j.dayOfWeek] = [];
    jobsByDay[j.dayOfWeek].push(j);
  });

  return (
    <div className="pb-24">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h2 className="font-bold text-xl text-[#0D1B4E]">{user.name}</h2>
        <p className="text-gray-500 mb-4">Jun 2–8, 2026</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Who was your team leader?</label>
            <Select value={teamLeader} onValueChange={handleTeamLeaderChange}>
              <SelectTrigger className="w-full min-h-[48px] text-lg bg-gray-50">
                <SelectValue placeholder="Select team leader" />
              </SelectTrigger>
              <SelectContent>
                {ALL_USERS.filter(u => u.role === 'employee').map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How many people on your team?</label>
            <div className="flex gap-2">
              {[2, 3, 4].map((size) => (
                <button
                  key={size}
                  onClick={() => handleTeamSizeChange(size as 2 | 3 | 4)}
                  className={`flex-1 min-h-[48px] rounded-lg font-semibold text-lg transition-colors ${
                    teamSize === size 
                      ? 'bg-[#0D1B4E] text-white' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  data-testid={`btn-team-size-${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {DAYS_OF_WEEK.map((dayName, dayIndex) => {
          const dayJobs = jobsByDay[dayIndex] || [];
          // Only show days that have jobs, unless it's today (mocking today as Tuesday (1)) or user clicks add
          // For simplicity in this demo, let's show all days
          return (
            <div key={dayIndex} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 uppercase border-b border-gray-200">
                {dayName}
              </div>
              <div className="p-4 space-y-4">
                {dayJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onUpdate={(updates) => handleUpdateJob(job.id, updates)} 
                    onDelete={() => handleDeleteJob(job.id)} 
                  />
                ))}
                
                <button
                  onClick={() => handleAddJob(dayIndex)}
                  className="w-full border-2 border-dashed border-[#1DC8FF] text-[#1DC8FF] bg-white rounded-xl py-3 text-center font-medium hover:bg-blue-50 transition-colors"
                  data-testid={`btn-add-job-${dayIndex}`}
                >
                  + Add a Job for {dayName}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-[64px] lg:bottom-0 left-0 right-0 lg:left-[220px] bg-[#0D1B4E] text-white px-4 py-3 flex justify-between items-center shadow-lg z-30">
        <div className="text-sm text-gray-300">Week Total</div>
        <div className="text-[#1DC8FF] font-bold text-xl">${totalApprovedPay.toFixed(2)}</div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-sm">
              View Summary
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl sm:max-w-md sm:mx-auto">
            <SheetHeader>
              <SheetTitle>Pay Summary</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Jobs Pay (Approved)</span>
                <span className="font-semibold">${totalApprovedPay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Drive Pay</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Deductions</span>
                <span className="font-semibold text-red-500">-$0.00</span>
              </div>
              <div className="h-px bg-gray-200 my-4" />
              <div className="flex justify-between items-center text-xl font-bold text-[#0D1B4E]">
                <span>Total Pay</span>
                <span>${totalApprovedPay.toFixed(2)}</span>
              </div>
              
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <Clock className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-yellow-800">
                  Waiting for Dexter's approval on {jobs.filter(j => j.status === 'pending').length} jobs. 
                  Those jobs will be added to your total once approved.
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function JobCard({ job, onUpdate, onDelete }: { job: JobEntry; onUpdate: (updates: Partial<JobEntry>) => void; onDelete: () => void }) {
  const isLocked = job.status !== 'pending';
  
  const payResult = calculatePay(job);
  
  return (
    <div className={`border rounded-xl p-4 relative ${isLocked ? 'bg-gray-50 border-gray-200 opacity-90' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Property</label>
          {isLocked ? (
            <div className="font-medium text-lg">{job.property || 'None selected'}</div>
          ) : (
            <PropertySearch 
              value={job.property} 
              onChange={(prop) => onUpdate({ property: prop })} 
            />
          )}
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Job Type</label>
          {isLocked ? (
            <div className="font-medium text-lg">{JOB_TYPE_OPTIONS.find(o => o.value === job.jobType)?.label || job.jobType}</div>
          ) : (
            <Select value={job.jobType} onValueChange={(val) => onUpdate({ jobType: val, tier: undefined })}>
              <SelectTrigger className="w-full min-h-[48px] text-lg bg-gray-50">
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {job.jobType === 'clubhouse' && !isLocked && (
          <div className="flex gap-2">
            {['150', '120', '80'].map(t => (
              <button
                key={t}
                onClick={() => onUpdate({ tier: t })}
                className={`flex-1 min-h-[40px] rounded-md font-medium transition-colors ${job.tier === t ? 'bg-[#0D1B4E] text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
              >
                ${t}
              </button>
            ))}
          </div>
        )}
        
        {job.jobType === 'club_hallway' && !isLocked && (
          <div className="flex gap-2">
            {['725', '500'].map(t => (
              <button
                key={t}
                onClick={() => onUpdate({ tier: t })}
                className={`flex-1 min-h-[40px] rounded-md font-medium transition-colors ${job.tier === t ? 'bg-[#0D1B4E] text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
              >
                ${t}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
            {isLocked ? (
              <div className="font-bold text-xl">{job.quantity}</div>
            ) : (
              <QuantityStepper 
                value={job.quantity} 
                onChange={(q) => onUpdate({ quantity: q })} 
              />
            )}
          </div>
          
          {!isLocked && (
            <button 
              onClick={onDelete}
              className="p-3 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors mt-4"
              title="Delete job"
            >
              <Trash2 size={24} />
            </button>
          )}
        </div>
        
        {payResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
            <div className="text-green-800 font-medium text-sm flex justify-between items-center">
              <span>{job.isLeader ? 'Your Pay (Leader)' : 'Your Pay (Member)'}</span>
              <span className="font-bold text-lg">${payResult.myPay.toFixed(2)}</span>
            </div>
            {job.isLeader && job.teamSize > 1 && (
              <div className="text-green-700/80 text-xs mt-1">
                Each Member Pay: ${(payResult.memberPay * job.quantity).toFixed(2)}
              </div>
            )}
          </div>
        )}
        
        <div className="pt-2 flex items-center justify-between border-t border-gray-100">
          {job.status === 'pending' ? (
            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Waiting for approval</span>
            </div>
          ) : job.status === 'approved' ? (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
              <CheckCircle size={14} className="text-green-600" />
              <span>Approved by Dexter</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span>Locked</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}