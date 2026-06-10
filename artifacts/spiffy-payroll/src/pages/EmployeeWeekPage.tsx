import React, { useState, useEffect } from 'react';
import { getSession } from '@/utils/auth';
import { DEMO_WEEK } from '@/data/demoWeek';
import { getJobsForEmployee, addJob, updateJob, deleteJob, generateId } from '@/utils/storage';
import { calculatePay } from '@/utils/payCalc';
import { JOB_TYPE_OPTIONS, FLAT_RATE_TYPES, WEEKLY_DRIVE_PAY } from '@/data/payRates';
import { PropertySearch } from '@/components/ui/PropertySearch';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, Clock, Car, ChevronRight } from 'lucide-react';
import type { JobEntry } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALL_USERS } from '@/data/employees';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const DAYS = [
  { name: 'Monday',    short: 'Mon' },
  { name: 'Tuesday',   short: 'Tue' },
  { name: 'Wednesday', short: 'Wed' },
  { name: 'Thursday',  short: 'Thu' },
  { name: 'Friday',    short: 'Fri' },
  { name: 'Saturday',  short: 'Sat' },
  { name: 'Sunday',    short: 'Sun' },
];

export default function EmployeeWeekPage() {
  const user = getSession();
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [teamLeader, setTeamLeader] = useState<string>(user?.id || '');
  const [teamSize, setTeamSize] = useState<2 | 3 | 4>(3);

  useEffect(() => {
    if (user) {
      setJobs(getJobsForEmployee(user.id, DEMO_WEEK));
      setTeamLeader(user.id);
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
      createdAt: new Date().toISOString(),
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
    jobs.filter(j => j.status === 'pending').forEach(j => updateJob(j.id, { teamSize: size }));
    refreshJobs();
  };

  const handleTeamLeaderChange = (leaderId: string) => {
    setTeamLeader(leaderId);
    if (!user) return;
    const isLeader = user.id === leaderId;
    jobs.filter(j => j.status === 'pending').forEach(j => updateJob(j.id, { teamLeader: leaderId, isLeader }));
    refreshJobs();
  };

  if (!user) return null;

  const jobsByDay: Record<number, JobEntry[]> = {};
  jobs.forEach(j => {
    if (!jobsByDay[j.dayOfWeek]) jobsByDay[j.dayOfWeek] = [];
    jobsByDay[j.dayOfWeek].push(j);
  });

  const approvedPay = jobs
    .filter(j => j.status === 'approved')
    .reduce((sum, j) => sum + (calculatePay(j)?.myPay ?? 0), 0);

  const pendingPay = jobs
    .filter(j => j.status === 'pending')
    .reduce((sum, j) => sum + (calculatePay(j)?.myPay ?? 0), 0);

  const grandTotal = approvedPay + WEEKLY_DRIVE_PAY;

  const getDayTotal = (dayJobs: JobEntry[]) =>
    dayJobs.reduce((sum, j) => sum + (calculatePay(j)?.myPay ?? 0), 0);

  return (
    <div className="pb-28">
      {/* Week header card */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ boxShadow: '0 4px 20px rgba(13,27,78,0.14)' }}>
        <div style={{ background: 'linear-gradient(135deg, #0D1B4E 0%, #162774 100%)' }} className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-xl text-white">{user.name}</h2>
              <p className="text-[#1DC8FF]/80 text-sm mt-0.5">Jun 2–8, 2026</p>
            </div>
            <div className="text-right">
              <div className="text-[#1DC8FF]/60 text-xs font-semibold uppercase tracking-wide">Approved</div>
              <div className="text-white font-bold text-2xl">${approvedPay.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Team Leader</label>
            <Select value={teamLeader} onValueChange={handleTeamLeaderChange}>
              <SelectTrigger className="w-full min-h-[44px] bg-gray-50 border-gray-200 rounded-xl">
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
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Team Size</label>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map(size => (
                <button
                  key={size}
                  onClick={() => handleTeamSizeChange(size)}
                  className={`flex-1 min-h-[44px] rounded-xl font-bold text-lg transition-all ${
                    teamSize === size
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  style={teamSize === size ? { background: 'linear-gradient(135deg, #0D1B4E, #1a3282)', boxShadow: '0 4px 12px rgba(13,27,78,0.25)' } : {}}
                  data-testid={`btn-team-size-${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Day sections */}
      <div className="space-y-5">
        {DAYS.map(({ name, short }, dayIndex) => {
          const dayJobs = jobsByDay[dayIndex] || [];
          const dayTotal = getDayTotal(dayJobs);
          const hasJobs = dayJobs.length > 0;

          return (
            <div key={dayIndex} className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(13,27,78,0.10)' }}>
              {/* Day header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ background: 'linear-gradient(90deg, #0D1B4E 0%, #162774 100%)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#1DC8FF] text-xs font-bold uppercase tracking-widest">{short}</span>
                  <span className="text-white/40 text-xs">·</span>
                  <span className="text-white/60 text-xs">{name}</span>
                </div>
                {hasJobs && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/50 text-xs">{dayJobs.length} {dayJobs.length === 1 ? 'job' : 'jobs'}</span>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 space-y-3">
                {dayJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onUpdate={updates => handleUpdateJob(job.id, updates)}
                    onDelete={() => handleDeleteJob(job.id)}
                  />
                ))}

                {/* Daily Total row */}
                {hasJobs && (
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: 'linear-gradient(90deg, rgba(29,200,255,0.08), rgba(29,200,255,0.04))' }}>
                    <span className="text-xs font-bold text-[#0D1B4E]/60 uppercase tracking-wide">Daily Total</span>
                    <span className="font-bold text-[#0D1B4E] text-base">${dayTotal.toFixed(2)}</span>
                  </div>
                )}

                <button
                  onClick={() => handleAddJob(dayIndex)}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  style={{ border: '2px dashed rgba(29,200,255,0.5)', color: '#1DC8FF', background: 'rgba(29,200,255,0.04)' }}
                  data-testid={`btn-add-job-${dayIndex}`}
                >
                  + Add Job for {name}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky bottom bar */}
      <div
        className="fixed bottom-[64px] lg:bottom-0 left-0 right-0 lg:left-[230px] z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(90deg, #0D1B4E 0%, #0f2060 100%)', boxShadow: '0 -4px 20px rgba(13,27,78,0.3)' }}
      >
        <div className="flex-1">
          <div className="text-white/50 text-xs">Week Approved Pay</div>
          <div className="text-[#1DC8FF] font-bold text-xl leading-tight">${approvedPay.toFixed(2)}</div>
        </div>

        {pendingPay > 0 && (
          <div className="text-right">
            <div className="text-white/40 text-xs">+ Pending</div>
            <div className="text-yellow-400 font-bold">${pendingPay.toFixed(2)}</div>
          </div>
        )}

        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="text-[#0D1B4E] font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #1DC8FF, #00b8f0)' }}
            >
              Summary <ChevronRight size={14} />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-3xl">
            <SheetHeader className="mb-2">
              <SheetTitle className="text-[#0D1B4E] text-xl">Pay Summary</SheetTitle>
              <p className="text-gray-400 text-sm">Week of Jun 2–8, 2026</p>
            </SheetHeader>

            <div className="py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jobs Pay (Approved)</span>
                <span className="font-bold text-[#0D1B4E] text-lg">${approvedPay.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center rounded-xl px-4 py-3" style={{ background: 'rgba(29,200,255,0.08)' }}>
                <div className="flex items-center gap-2 text-[#0D1B4E]">
                  <Car size={16} className="text-[#1DC8FF]" />
                  <span className="font-semibold">Weekly Drive Pay</span>
                </div>
                <span className="font-bold text-[#1DC8FF] text-lg">+${WEEKLY_DRIVE_PAY.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Deductions</span>
                <span className="font-semibold text-red-500">-$0.00</span>
              </div>

              <div className="h-px bg-gray-100 my-2" />

              <div
                className="flex justify-between items-center rounded-xl px-4 py-4"
                style={{ background: 'linear-gradient(135deg, #0D1B4E, #162774)' }}
              >
                <span className="text-white font-bold text-lg">Total Pay</span>
                <span className="text-[#1DC8FF] font-bold text-2xl">${grandTotal.toFixed(2)}</span>
              </div>

              {jobs.filter(j => j.status === 'pending').length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Clock className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">{jobs.filter(j => j.status === 'pending').length} jobs pending approval</span> — an additional <span className="font-semibold">${pendingPay.toFixed(2)}</span> will be added once Dexter approves them.
                  </p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function JobCard({ job, onUpdate, onDelete }: {
  job: JobEntry;
  onUpdate: (updates: Partial<JobEntry>) => void;
  onDelete: () => void;
}) {
  const isLocked = job.status !== 'pending';
  const payResult = calculatePay(job);
  const isFlatRate = FLAT_RATE_TYPES.has(job.jobType);

  const jobLabel = JOB_TYPE_OPTIONS.find(o => o.value === job.jobType)?.label ?? job.jobType;
  const isNewService = job.jobType === 'carpet_cleaning' || job.jobType === 'painting';

  return (
    <div className={`rounded-xl overflow-hidden border transition-all ${
      isLocked
        ? 'border-gray-100 bg-gray-50/60'
        : 'border-gray-200 bg-white shadow-sm'
    }`}>
      {isNewService && (
        <div className="px-4 py-1.5 text-xs font-bold text-white flex items-center gap-1.5" style={{ background: 'linear-gradient(90deg, #7c3aed, #9333ea)' }}>
          ✦ Additional Service
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Property */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Property</label>
          {isLocked ? (
            <div className="font-semibold text-[#1A1A2A]">{job.property || 'Not set'}</div>
          ) : (
            <PropertySearch value={job.property} onChange={prop => onUpdate({ property: prop })} />
          )}
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Job Type</label>
          {isLocked ? (
            <div className="font-semibold text-[#1A1A2A]">{jobLabel}</div>
          ) : (
            <Select value={job.jobType} onValueChange={val => onUpdate({ jobType: val, tier: undefined, specialtyPay: undefined })}>
              <SelectTrigger className="w-full min-h-[44px] bg-gray-50 rounded-xl border-gray-200">
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                {['Standard', 'Additional Services'].map(group => {
                  const opts = JOB_TYPE_OPTIONS.filter(o => o.group === group);
                  return (
                    <React.Fragment key={group}>
                      <div className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide">{group}</div>
                      {opts.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </React.Fragment>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Clubhouse tier */}
        {job.jobType === 'clubhouse' && !isLocked && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Clubhouse Size</label>
            <div className="flex gap-2">
              {['150', '120', '80'].map(t => (
                <button
                  key={t}
                  onClick={() => onUpdate({ tier: t })}
                  className={`flex-1 min-h-[40px] rounded-xl font-semibold transition-all ${job.tier === t ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  style={job.tier === t ? { background: 'linear-gradient(135deg, #0D1B4E, #1a3282)' } : {}}
                >
                  ${t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Club hallway tier */}
        {job.jobType === 'club_hallway' && !isLocked && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Rate Tier</label>
            <div className="flex gap-2">
              {['725', '500'].map(t => (
                <button
                  key={t}
                  onClick={() => onUpdate({ tier: t })}
                  className={`flex-1 min-h-[40px] rounded-xl font-semibold transition-all ${job.tier === t ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  style={job.tier === t ? { background: 'linear-gradient(135deg, #0D1B4E, #1a3282)' } : {}}
                >
                  ${t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Flat-rate pay input (specialty, carpet, painting) */}
        {isFlatRate && !isLocked && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              {job.jobType === 'carpet_cleaning' ? 'Carpet Cleaning Pay' : job.jobType === 'painting' ? 'Painting Pay' : 'Specialty Pay'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full pl-7 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg font-semibold text-[#0D1B4E] focus:outline-none focus:ring-2 focus:ring-[#1DC8FF]/40"
                placeholder="0.00"
                value={job.specialtyPay ?? ''}
                onChange={e => onUpdate({ specialtyPay: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}

        {/* Flat-rate display when locked */}
        {isFlatRate && isLocked && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Pay</label>
            <div className="font-bold text-[#0D1B4E]">${(job.specialtyPay ?? 0).toFixed(2)}</div>
          </div>
        )}

        {/* Quantity + delete */}
        {!isFlatRate && (
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Quantity</label>
              {isLocked ? (
                <div className="font-bold text-2xl text-[#0D1B4E]">{job.quantity}</div>
              ) : (
                <QuantityStepper value={job.quantity} onChange={q => onUpdate({ quantity: q })} />
              )}
            </div>
            {!isLocked && (
              <button
                onClick={onDelete}
                className="p-3 text-gray-300 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all mt-4"
                title="Delete job"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        )}

        {isFlatRate && !isLocked && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-gray-300 hover:text-red-500 text-xs font-medium transition-all"
          >
            <Trash2 size={14} /> Remove
          </button>
        )}

        {/* Pay result */}
        {payResult && payResult.myPay > 0 && (
          <div
            className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ background: 'linear-gradient(90deg, rgba(13,27,78,0.05), rgba(29,200,255,0.06))' }}
          >
            <span className="text-[#0D1B4E]/70 text-sm font-medium">
              {isFlatRate ? 'This Job' : job.isLeader ? 'Leader Pay' : 'Member Pay'}
            </span>
            <span className="font-bold text-[#0D1B4E] text-lg">${payResult.myPay.toFixed(2)}</span>
          </div>
        )}

        {/* Status */}
        <div className="pt-1 flex items-center justify-between border-t border-gray-100">
          {job.status === 'pending' ? (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-amber-100">
              <div className="w-2 h-2 rounded-full bg-amber-400 status-dot-pending" />
              Waiting for approval
            </div>
          ) : job.status === 'approved' ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-100">
              <CheckCircle size={13} className="text-emerald-500" />
              Approved by Dexter
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              Locked
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
