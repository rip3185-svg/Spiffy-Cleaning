import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { DEMO_WEEK } from '@/data/demoWeek';
import { TEAM_MEMBERS } from '@/data/employees';
import { getJobsForEmployee, updateJob, saveWeekSummary } from '@/utils/storage';
import { calculatePay } from '@/utils/payCalc';
import type { JobEntry } from '@/types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ManagerEmployeeDetailPage() {
  const [, params] = useRoute('/manager/employee/:id');
  const employeeId = params?.id;
  const employee = TEAM_MEMBERS.find(e => e.id === employeeId);
  
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [confirmApproveAll, setConfirmApproveAll] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);

  useEffect(() => {
    if (employeeId) {
      setJobs(getJobsForEmployee(employeeId, DEMO_WEEK));
    }
  }, [employeeId]);

  if (!employee) return <div>Employee not found</div>;

  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const approvedJobs = jobs.filter(j => j.status === 'approved');
  const isAllApproved = jobs.length > 0 && pendingJobs.length === 0;

  let totalPay = 0;
  jobs.forEach(j => {
    const pay = calculatePay(j);
    if (pay) totalPay += pay.myPay;
  });

  const handleApproveJob = (job: JobEntry) => {
    updateJob(job.id, { status: 'approved' });
    setJobs(getJobsForEmployee(employeeId!, DEMO_WEEK));
    const pay = calculatePay(job);
    toast.success(`Approved 1 job for ${employee.name}. Pay: $${pay?.myPay.toFixed(2)}`);
  };

  const handleApproveAll = () => {
    pendingJobs.forEach(job => {
      updateJob(job.id, { status: 'approved' });
    });
    setJobs(getJobsForEmployee(employeeId!, DEMO_WEEK));
    toast.success(`Approved all ${pendingJobs.length} jobs for ${employee.name}`);
  };

  const handleLockWeek = () => {
    saveWeekSummary({
      employeeId: employee.id,
      weekStart: DEMO_WEEK,
      totalPay,
      drivePay: 0,
      deductions: 0,
      status: 'locked',
      lockedAt: new Date().toISOString()
    });
    // In a real app we'd update all jobs to 'locked' here
    toast.success(`Locked week for ${employee.name}`);
  };

  // Group jobs by day
  const jobsByDay: Record<number, JobEntry[]> = {};
  jobs.forEach(j => {
    if (!jobsByDay[j.dayOfWeek]) jobsByDay[j.dayOfWeek] = [];
    jobsByDay[j.dayOfWeek].push(j);
  });

  // Find prev/next employees for navigation
  const currentIndex = TEAM_MEMBERS.findIndex(e => e.id === employeeId);
  const prevEmp = currentIndex > 0 ? TEAM_MEMBERS[currentIndex - 1] : null;
  const nextEmp = currentIndex < TEAM_MEMBERS.length - 1 ? TEAM_MEMBERS[currentIndex + 1] : null;

  return (
    <div className="pb-24">
      <div className="flex items-center text-sm text-[#1DC8FF] mb-4 font-medium">
        <Link href="/manager/overview" className="flex items-center hover:underline">
          <ChevronLeft size={16} className="mr-1" /> Back to Team
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{employee.name}</h1>
          <p className="text-white/50 text-sm mt-0.5">Week of Jun 2–8, 2026</p>
        </div>
        
        {pendingJobs.length > 0 && (
          <Button 
            onClick={() => setConfirmApproveAll(true)}
            className="bg-[#16A34A] text-white hover:bg-green-700"
          >
            Approve All ({pendingJobs.length})
          </Button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          No job entries for this week.
        </div>
      ) : (
        <div className="space-y-6">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const dayJobs = jobsByDay[dayIndex];
            if (!dayJobs || dayJobs.length === 0) return null;
            
            return (
              <div key={dayIndex} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 uppercase border-b border-gray-200">
                  {dayName}
                </div>
                <div className="divide-y divide-gray-100">
                  {dayJobs.map(job => {
                    const pay = calculatePay(job);
                    const isApproved = job.status === 'approved' || job.status === 'locked';
                    
                    return (
                      <div key={job.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isApproved ? 'bg-white' : 'bg-yellow-50/30'}`}>
                        <div className="flex-1">
                          <div className="font-bold text-[#1A1A2A] text-lg">{job.property}</div>
                          <div className="text-gray-600 text-sm mt-1">
                            {job.jobType} {job.tier ? `(Tier ${job.tier})` : ''} • Qty: {job.quantity} • Team: {job.teamSize}
                          </div>
                          <div className="text-sm font-medium text-green-700 mt-1">
                            Pay: ${pay?.myPay.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="shrink-0">
                          {isApproved ? (
                            <Button disabled variant="outline" className="w-full sm:w-auto border-green-200 bg-green-50 text-green-700 opacity-100">
                              <Check size={16} className="mr-2" /> Approved
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleApproveJob(job)}
                              className="w-full sm:w-auto bg-yellow-500 text-white hover:bg-yellow-600 border-none shadow-sm"
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAllApproved && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <Check size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">All Jobs Approved</h3>
          <p className="text-green-700 mb-6">Total calculated pay: ${totalPay.toFixed(2)}</p>
          <Button 
            onClick={() => setConfirmLock(true)}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-100"
          >
            Lock Week Permanently
          </Button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 lg:left-[220px] bg-white border-t border-gray-200 p-4 flex justify-between items-center z-30">
        <Link href={prevEmp ? `/manager/employee/${prevEmp.id}` : '#'} className={!prevEmp ? 'pointer-events-none opacity-50' : ''}>
          <Button variant="outline" className="text-gray-600"><ChevronLeft size={16} className="mr-1" /> Prev Employee</Button>
        </Link>
        <div className="font-bold text-[#0D1B4E]">Total: ${totalPay.toFixed(2)}</div>
        <Link href={nextEmp ? `/manager/employee/${nextEmp.id}` : '#'} className={!nextEmp ? 'pointer-events-none opacity-50' : ''}>
          <Button variant="outline" className="text-gray-600">Next <ChevronRight size={16} className="ml-1" /></Button>
        </Link>
      </div>

      <ConfirmDialog
        open={confirmApproveAll}
        onOpenChange={setConfirmApproveAll}
        title={`Approve all jobs for ${employee.name}?`}
        description={`This will approve ${pendingJobs.length} jobs totaling $${totalPay.toFixed(2)}. They will be marked as ready for payroll.`}
        confirmLabel="Yes, Approve All"
        onConfirm={handleApproveAll}
        variant="success"
      />

      <ConfirmDialog
        open={confirmLock}
        onOpenChange={setConfirmLock}
        title={`Lock week for ${employee.name}?`}
        description="This will lock the records for this week permanently. The employee will not be able to make any changes."
        confirmLabel="Lock Week"
        onConfirm={handleLockWeek}
        variant="primary"
      />
    </div>
  );
}