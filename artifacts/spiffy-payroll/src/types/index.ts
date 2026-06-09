export type Role = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  password: string;
}

export type JobStatus = 'pending' | 'approved' | 'locked';

export interface JobEntry {
  id: string;
  employeeId: string;
  weekStart: string;
  dayOfWeek: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  property: string;
  jobType: string;
  tier?: string;
  quantity: number;
  teamSize: 2 | 3 | 4;
  teamLeader: string;
  isLeader: boolean;
  status: JobStatus;
  specialtyPay?: number;
  createdAt: string;
}

export interface WeekSummary {
  employeeId: string;
  weekStart: string;
  totalPay: number;
  drivePay: number;
  deductions: number;
  status: 'pending' | 'approved' | 'locked';
  approvedAt?: string;
  lockedAt?: string;
}

export interface Invoice {
  id: string;
  client: string;
  invoiceNum: string;
  dueDate: string;
  amount: number;
  daysLate: number | 'upcoming';
}
