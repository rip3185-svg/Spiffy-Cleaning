export type TeamSize = 2 | 3 | 4;
export interface RateRow { leader: number; member: number; }

export const PAY_RATES: Record<string, Record<TeamSize, RateRow>> = {
  units:    { 2:{leader:55,member:50},   3:{leader:38,member:33.5}, 4:{leader:30,member:25} },
  building: { 2:{leader:55,member:45},   3:{leader:36,member:32},   4:{leader:30,member:23.5} },
  hallway:  { 2:{leader:90,member:85},   3:{leader:63,member:56},   4:{leader:47,member:42} },
  touchup:  { 2:{leader:17,member:13},   3:{leader:13,member:8.5},  4:{leader:10,member:6} },
  lkq:      { 2:{leader:25,member:20},   3:{leader:17,member:14},   4:{leader:15,member:10} },
};

export const CLUBHOUSE_RATES: Record<string, Record<TeamSize, RateRow>> = {
  '150': { 2:{leader:80,member:70},  3:{leader:55,member:47},  4:{leader:45,member:35} },
  '120': { 2:{leader:65,member:55},  3:{leader:45,member:37},  4:{leader:35,member:28} },
  '80':  { 2:{leader:45,member:35},  3:{leader:30,member:25},  4:{leader:25,member:18} },
};

export const CLUB_HALLWAY_RATES: Record<string, Record<TeamSize, RateRow>> = {
  '725': { 2:{leader:375,member:350}, 3:{leader:265,member:230}, 4:{leader:200,member:175} },
  '500': { 2:{leader:260,member:240}, 3:{leader:180,member:160}, 4:{leader:135,member:120} },
};

export const JOB_TYPE_OPTIONS = [
  { value:'units',           label:'Unit Cleaning',              baseRate:105,  group:'Standard' },
  { value:'building',        label:'Building / Enterprise',      baseRate:100,  group:'Standard' },
  { value:'hallway',         label:'Hallway (Small)',            baseRate:175,  group:'Standard' },
  { value:'clubhouse',       label:'Clubhouse Cleaning',         baseRate:null, group:'Standard' },
  { value:'club_hallway',    label:'Clubhouse + Hallway',        baseRate:null, group:'Standard' },
  { value:'touchup',         label:'Touch-Up',                   baseRate:30,   group:'Standard' },
  { value:'lkq',             label:'LKQ',                        baseRate:45,   group:'Standard' },
  { value:'carpet_cleaning', label:'Carpet Cleaning ✦ New',      baseRate:null, group:'Additional Services' },
  { value:'painting',        label:'Apartment Painting ✦ New',   baseRate:null, group:'Additional Services' },
  { value:'specialty',       label:'Specialty / Other',          baseRate:null, group:'Additional Services' },
];

// Flat-rate job types where user enters pay directly
export const FLAT_RATE_TYPES = new Set(['carpet_cleaning', 'painting', 'specialty']);
export const WEEKLY_DRIVE_PAY = 100;
