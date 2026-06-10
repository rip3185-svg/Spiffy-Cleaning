import React from 'react';
import { PAY_RATES, CLUBHOUSE_RATES, CLUB_HALLWAY_RATES } from '@/data/payRates';
import type { TeamSize } from '@/data/payRates';
import { Info } from 'lucide-react';

export default function PayRatesPage() {
  const teamSizes: TeamSize[] = [2, 3, 4];

  const renderTable = (title: string, dataObj: Record<TeamSize, { leader: number, member: number }>) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-4 py-3 bg-[#0D1B4E] text-white font-semibold">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <th className="p-3 font-medium">Team Size</th>
              <th className="p-3 font-medium text-right">Leader Pay</th>
              <th className="p-3 font-medium text-right">Member Pay</th>
              <th className="p-3 font-medium text-right bg-blue-50">Row Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teamSizes.map(ts => {
              const row = dataObj[ts];
              const total = row.leader + (row.member * (ts - 1));
              return (
                <tr key={ts} className="hover:bg-gray-50">
                  <td className="p-3 font-bold text-[#1A1A2A]">{ts} People</td>
                  <td className="p-3 text-right font-medium text-green-700">${row.leader.toFixed(2)}</td>
                  <td className="p-3 text-right font-medium text-gray-700">${row.member.toFixed(2)}</td>
                  <td className="p-3 text-right font-bold text-[#0D1B4E] bg-blue-50/30">${total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="pb-24 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Pay Rate Reference</h1>
      <p className="text-white/50 text-sm mb-4">Rates set by Dexter — contact your manager for questions</p>

      <div className="rounded-xl p-3 mb-6 text-sm flex gap-2 border" style={{ background: 'rgba(29,200,255,0.08)', borderColor: 'rgba(29,200,255,0.2)', color: 'rgba(29,200,255,0.9)' }}>
        <div className="font-bold shrink-0">ℹ</div>
        <div>These rates are fixed. Team size affects per-job pay — bigger teams earn less per job but move faster.</div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-base font-bold text-white/70 uppercase tracking-widest mb-4">Standard Cleaning</h2>
          {renderTable("Unit Cleaning (Units)", PAY_RATES['units'])}
          {renderTable("Building Cleaning", PAY_RATES['building'])}
          {renderTable("Small Hallway", PAY_RATES['hallway'])}
        </section>

        <section>
          <h2 className="text-base font-bold text-white/70 uppercase tracking-widest mb-4">Clubhouse Cleaning</h2>
          {renderTable("Clubhouse - Tier $150", CLUBHOUSE_RATES['150'])}
          {renderTable("Clubhouse - Tier $120", CLUBHOUSE_RATES['120'])}
          {renderTable("Clubhouse - Tier $80", CLUBHOUSE_RATES['80'])}
        </section>

        <section>
          <h2 className="text-base font-bold text-white/70 uppercase tracking-widest mb-4">Clubhouse / Hallway Combos</h2>
          {renderTable("Club/Hallway - Tier $725", CLUB_HALLWAY_RATES['725'])}
          {renderTable("Club/Hallway - Tier $500", CLUB_HALLWAY_RATES['500'])}
        </section>

        <section>
          <h2 className="text-base font-bold text-white/70 uppercase tracking-widest mb-4">Other Services</h2>
          {renderTable("LKQ", PAY_RATES['lkq'])}
          {renderTable("Touch-Up", PAY_RATES['touchup'])}
        </section>
      </div>
    </div>
  );
}