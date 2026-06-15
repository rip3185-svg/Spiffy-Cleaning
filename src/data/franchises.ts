export interface FranchiseLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  owner: string;
  phone: string;
  startDate: string; // ISO date
  employeeCount: number;
  status: 'active' | 'onboarding' | 'watch';
  // Monthly metrics for last 6 months (oldest → newest)
  monthlyRevenue: number[];
  monthlyJobs: number[];
  collectionRate: number; // 0-100 %
  outstandingAR: number;
  avgJobValue: number;
  clientCount: number;
  topClients: string[];
  ytdRevenue: number;
  ytdGrowth: number; // % vs last year
  lastPayrollTotal: number;
  lastPayrollDate: string;
  notes?: string;
}

export const FRANCHISE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export const FRANCHISES: FranchiseLocation[] = [
  {
    id: 'detroit',
    name: 'Spiffy Detroit',
    city: 'Detroit',
    state: 'MI',
    owner: 'Dexter Thomas',
    phone: '(313) 555-0142',
    startDate: '2019-03-01',
    employeeCount: 7,
    status: 'active',
    monthlyRevenue: [28400, 31200, 33800, 35600, 38200, 41500],
    monthlyJobs: [112, 124, 138, 145, 158, 171],
    collectionRate: 87,
    outstandingAR: 55400,
    avgJobValue: 242,
    clientCount: 33,
    topClients: ['Woodview Commons', 'Conner Creek', 'Carriage Cove'],
    ytdRevenue: 208700,
    ytdGrowth: 18.4,
    lastPayrollTotal: 4280,
    lastPayrollDate: '2026-06-08',
    notes: 'Flagship location — strongest growth trajectory'
  },
  {
    id: 'warren',
    name: 'Spiffy Warren',
    city: 'Warren',
    state: 'MI',
    owner: 'Marcus Webb',
    phone: '(586) 555-0271',
    startDate: '2022-07-15',
    employeeCount: 4,
    status: 'active',
    monthlyRevenue: [14200, 15800, 16400, 17100, 18900, 19200],
    monthlyJobs: [58, 64, 69, 72, 79, 81],
    collectionRate: 92,
    outstandingAR: 12400,
    avgJobValue: 237,
    clientCount: 18,
    topClients: ['Sterling Heights Plaza', 'Lakeside Apts', 'Maple Commons'],
    ytdRevenue: 101600,
    ytdGrowth: 24.1,
    lastPayrollTotal: 2140,
    lastPayrollDate: '2026-06-08',
  },
  {
    id: 'ann-arbor',
    name: 'Spiffy Ann Arbor',
    city: 'Ann Arbor',
    state: 'MI',
    owner: 'Priya Nair',
    phone: '(734) 555-0388',
    startDate: '2023-01-10',
    employeeCount: 3,
    status: 'onboarding',
    monthlyRevenue: [7200, 8100, 9400, 10200, 11800, 12600],
    monthlyJobs: [29, 33, 39, 43, 49, 53],
    collectionRate: 95,
    outstandingAR: 4800,
    avgJobValue: 238,
    clientCount: 11,
    topClients: ['U of M Housing', 'Arbor Hills Apts', 'Stadium Commons'],
    ytdRevenue: 59300,
    ytdGrowth: 41.2,
    lastPayrollTotal: 1260,
    lastPayrollDate: '2026-06-08',
    notes: 'High growth — ready to scale to 5 employees'
  },
  {
    id: 'flint',
    name: 'Spiffy Flint',
    city: 'Flint',
    state: 'MI',
    owner: 'Darnell Simmons',
    phone: '(810) 555-0156',
    startDate: '2021-05-20',
    employeeCount: 5,
    status: 'watch',
    monthlyRevenue: [19800, 18400, 17200, 16800, 15900, 16200],
    monthlyJobs: [81, 75, 70, 68, 65, 67],
    collectionRate: 74,
    outstandingAR: 31200,
    avgJobValue: 242,
    clientCount: 22,
    topClients: ['Flint Crossings', 'North Side Manor', 'Riverfront Plaza'],
    ytdRevenue: 104300,
    ytdGrowth: -8.6,
    lastPayrollTotal: 2890,
    lastPayrollDate: '2026-06-08',
    notes: 'Collection rate declining — scheduled call Jun 12'
  },
  {
    id: 'lansing',
    name: 'Spiffy Lansing',
    city: 'Lansing',
    state: 'MI',
    owner: 'Tiana Brooks',
    phone: '(517) 555-0204',
    startDate: '2024-02-28',
    employeeCount: 2,
    status: 'onboarding',
    monthlyRevenue: [0, 0, 3800, 5200, 7100, 8400],
    monthlyJobs: [0, 0, 16, 22, 30, 35],
    collectionRate: 98,
    outstandingAR: 1200,
    avgJobValue: 240,
    clientCount: 7,
    topClients: ['Capitol Commons', 'Eastside Village', 'Redwood Apts'],
    ytdRevenue: 24500,
    ytdGrowth: 0,
    lastPayrollTotal: 680,
    lastPayrollDate: '2026-06-08',
    notes: 'Launched Feb 2024 — on track for Q3 breakeven'
  }
];