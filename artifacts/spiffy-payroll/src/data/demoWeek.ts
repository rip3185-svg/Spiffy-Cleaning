import type { JobEntry, WeekSummary } from '../types';
const WEEK = '2026-06-02';
export const DEMO_WEEK = WEEK;

export const DEMO_JOBS: JobEntry[] = [
  // JESENIA - approved
  {id:'j1',employeeId:'jesenia',weekStart:WEEK,dayOfWeek:1,property:'Woodview Commons',jobType:'club_hallway',tier:'725',quantity:1,teamSize:3,teamLeader:'jesenia',isLeader:true,status:'approved',createdAt:'2026-06-03T08:00:00Z'},
  {id:'j2',employeeId:'jesenia',weekStart:WEEK,dayOfWeek:1,property:'Conner Creek',jobType:'building',quantity:1,teamSize:3,teamLeader:'jesenia',isLeader:true,status:'approved',createdAt:'2026-06-03T10:00:00Z'},
  {id:'j3',employeeId:'jesenia',weekStart:WEEK,dayOfWeek:2,property:'Cherokee Hill',jobType:'units',quantity:3,teamSize:3,teamLeader:'jesenia',isLeader:true,status:'approved',createdAt:'2026-06-04T08:00:00Z'},
  {id:'j4',employeeId:'jesenia',weekStart:WEEK,dayOfWeek:2,property:'Cherokee Hill',jobType:'units',quantity:2,teamSize:3,teamLeader:'jesenia',isLeader:true,status:'approved',createdAt:'2026-06-04T11:00:00Z'},
  // JESENIA - pending
  {id:'j5',employeeId:'jesenia',weekStart:WEEK,dayOfWeek:3,property:'LKQ Corp',jobType:'lkq',quantity:2,teamSize:3,teamLeader:'jesenia',isLeader:true,status:'pending',createdAt:'2026-06-05T08:00:00Z'},
  {id:'j6',employeeId:'jesenia',weekStart:WEEK,dayOfWeek:3,property:'Bishop Moore',jobType:'building',quantity:1,teamSize:3,teamLeader:'jesenia',isLeader:true,status:'pending',createdAt:'2026-06-05T11:00:00Z'},
  // ALEJANDRO
  {id:'a1',employeeId:'alejandro',weekStart:WEEK,dayOfWeek:0,property:'Auburn Gates Apartments',jobType:'units',quantity:4,teamSize:3,teamLeader:'alejandro',isLeader:true,status:'approved',createdAt:'2026-06-02T08:00:00Z'},
  {id:'a2',employeeId:'alejandro',weekStart:WEEK,dayOfWeek:0,property:'Knollwood Village',jobType:'units',quantity:6,teamSize:3,teamLeader:'alejandro',isLeader:true,status:'approved',createdAt:'2026-06-02T12:00:00Z'},
  {id:'a3',employeeId:'alejandro',weekStart:WEEK,dayOfWeek:1,property:'Kings Pointe',jobType:'club_hallway',tier:'725',quantity:1,teamSize:3,teamLeader:'alejandro',isLeader:true,status:'pending',createdAt:'2026-06-03T08:00:00Z'},
  {id:'a4',employeeId:'alejandro',weekStart:WEEK,dayOfWeek:2,property:'West Oaks',jobType:'units',quantity:3,teamSize:3,teamLeader:'alejandro',isLeader:true,status:'pending',createdAt:'2026-06-04T08:00:00Z'},
  // GISSELL
  {id:'g1',employeeId:'gissell',weekStart:WEEK,dayOfWeek:0,property:'Woodview Commons',jobType:'club_hallway',tier:'725',quantity:1,teamSize:4,teamLeader:'gissell',isLeader:true,status:'approved',createdAt:'2026-06-02T08:00:00Z'},
  {id:'g2',employeeId:'gissell',weekStart:WEEK,dayOfWeek:1,property:'Richmond Club',jobType:'building',quantity:2,teamSize:4,teamLeader:'gissell',isLeader:true,status:'pending',createdAt:'2026-06-03T08:00:00Z'},
  {id:'g3',employeeId:'gissell',weekStart:WEEK,dayOfWeek:2,property:'Thornberry Apartments',jobType:'clubhouse',tier:'120',quantity:1,teamSize:4,teamLeader:'gissell',isLeader:true,status:'pending',createdAt:'2026-06-04T08:00:00Z'},
  // SUGEYDI
  {id:'s1',employeeId:'sugeydi',weekStart:WEEK,dayOfWeek:0,property:'Cherokee Hill',jobType:'units',quantity:5,teamSize:2,teamLeader:'sugeydi',isLeader:true,status:'approved',createdAt:'2026-06-02T08:00:00Z'},
  {id:'s2',employeeId:'sugeydi',weekStart:WEEK,dayOfWeek:1,property:'Windmill Pointe',jobType:'hallway',quantity:1,teamSize:2,teamLeader:'sugeydi',isLeader:true,status:'pending',createdAt:'2026-06-03T08:00:00Z'},
  // SUJEYDI
  {id:'su1',employeeId:'sujeydi',weekStart:WEEK,dayOfWeek:1,property:'Joy West Manor',jobType:'club_hallway',tier:'725',quantity:1,teamSize:3,teamLeader:'sujeydi',isLeader:true,status:'pending',createdAt:'2026-06-03T08:00:00Z'},
  {id:'su2',employeeId:'sujeydi',weekStart:WEEK,dayOfWeek:2,property:'Carriage Cove',jobType:'building',quantity:1,teamSize:3,teamLeader:'sujeydi',isLeader:true,status:'pending',createdAt:'2026-06-04T08:00:00Z'},
];

export const DEMO_WEEK_SUMMARIES: WeekSummary[] = [
  {employeeId:'jesenia',weekStart:'2026-05-19',totalPay:1100,drivePay:100,deductions:0,status:'locked',lockedAt:'2026-05-25T00:00:00Z'},
  {employeeId:'jesenia',weekStart:'2026-05-26',totalPay:1340,drivePay:100,deductions:0,status:'locked',lockedAt:'2026-06-01T00:00:00Z'},
];

export function seedDemoData(): void {
  const seeded = localStorage.getItem('spiffy_demo_seeded_v2');
  if (seeded) return;
  localStorage.removeItem('spiffy_demo_seeded');
  localStorage.setItem('spiffy_jobs', JSON.stringify(DEMO_JOBS));
  localStorage.setItem('spiffy_weeks', JSON.stringify(DEMO_WEEK_SUMMARIES));
  localStorage.setItem('spiffy_demo_seeded_v2', 'true');
}
