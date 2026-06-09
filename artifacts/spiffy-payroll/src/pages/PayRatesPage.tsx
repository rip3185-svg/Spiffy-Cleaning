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
      <h1 className="text-2xl font-bold text-[#0D1B4E] mb-4">Pay Rate Reference</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-blue-800 text-sm flex gap-2">
        <div className="font-bold shrink-0 mt-0.5">ℹ️</div>
        <div>These rates are set by Dexter. Contact your manager for questions or rate adjustments.</div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-[#1A1A2A] mb-4">Standard Cleaning</h2>
          {renderTable("Unit Cleaning (Units)", PAY_RATES['units'])}
          {renderTable("Building Cleaning", PAY_RATES['building'])}
          {renderTable("Small Hallway", PAY_RATES['hallway'])}
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A2A] mb-4">Clubhouse Cleaning</h2>
          {renderTable("Clubhouse - Tier $150", CLUBHOUSE_RATES['150'])}
          {renderTable("Clubhouse - Tier $120", CLUBHOUSE_RATES['120'])}
          {renderTable("Clubhouse - Tier $80", CLUBHOUSE_RATES['80'])}
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A2A] mb-4">Clubhouse / Hallway Combos</h2>
          {renderTable("Club/Hallway - Tier $725", CLUB_HALLWAY_RATES['725'])}
          {renderTable("Club/Hallway - Tier $500", CLUB_HALLWAY_RATES['500'])}
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A2A] mb-4">Other Services</h2>
          {renderTable("LKQ", PAY_RATES['lkq'])}
          {renderTable("Touch-Up", PAY_RATES['touchup'])}
        </section>
      </div>
    </div>
  );
}