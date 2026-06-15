import { PAY_RATES, CLUBHOUSE_RATES, CLUB_HALLWAY_RATES, FLAT_RATE_TYPES } from '../data/payRates';
import type { JobEntry } from '../types';

export interface PayResult {
  leaderPay: number;
  memberPay: number;
  rowTotal: number;
  myPay: number;
}

export function calculatePay(entry: Partial<JobEntry>): PayResult | null {
  const { jobType, tier, teamSize, quantity = 1, isLeader = false, specialtyPay } = entry;
  if (!jobType || !teamSize) return null;
  let leaderPay = 0, memberPay = 0;

  if (FLAT_RATE_TYPES.has(jobType)) {
    const pay = specialtyPay ?? 0;
    return { leaderPay: pay, memberPay: 0, rowTotal: pay * quantity, myPay: pay * quantity };
  }

  const ts = teamSize as 2 | 3 | 4;
  if (jobType === 'clubhouse') {
    if (!tier || !CLUBHOUSE_RATES[tier]) return null;
    leaderPay = CLUBHOUSE_RATES[tier][ts].leader;
    memberPay = CLUBHOUSE_RATES[tier][ts].member;
  } else if (jobType === 'club_hallway') {
    if (!tier || !CLUB_HALLWAY_RATES[tier]) return null;
    leaderPay = CLUB_HALLWAY_RATES[tier][ts].leader;
    memberPay = CLUB_HALLWAY_RATES[tier][ts].member;
  } else {
    if (!PAY_RATES[jobType]) return null;
    leaderPay = PAY_RATES[jobType][ts].leader;
    memberPay = PAY_RATES[jobType][ts].member;
  }

  const rowTotal = (leaderPay + memberPay * (teamSize - 1)) * quantity;
  const myPay = (isLeader ? leaderPay : memberPay) * quantity;
  return { leaderPay, memberPay, rowTotal, myPay };
}
