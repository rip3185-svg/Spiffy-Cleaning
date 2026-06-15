import React from 'react';
import { PAY_RATES, CLUBHOUSE_RATES, CLUB_HALLWAY_RATES } from '@/data/payRates';
import type { TeamSize } from '@/data/payRates';
import { useLang } from '@/i18n/LanguageContext';

export default function PayRatesPage() {
  const { t } = useLang();
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
              <th className="p-3 font-medium">{t.payRates.teamSize}</th>
              <th className="p-3 font-medium text-right">{t.payRates.leaderPay}</th>
              <th className="p-3 font-medium text-right">{t.payRates.memberPay}</th>
              <th className="p-3 font-medium text-right bg-blue-50">{t.payRates.rowTotal}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teamSizes.map(ts => {
              const row = dataObj[ts];
              const total = row.leader + (row.member * (ts - 1));
              return (
                <tr key={ts} className="hover:bg-gray-50">
                  <td className="p-3 font-bold text-[#1A1A2A]">{ts} {t.payRates.people}</td>
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
      <h1 className="text-2xl font-bold text-white mb-1">{t.payRates.title}</h1>
      <p className="text-white/50 text-sm mb-4">{t.payRates.subtitle}</p>

      <div className="rounded-xl p-3 mb-6 text-sm flex gap-2 border" style={{ background: 'rgba(29,200,255,0.08)', borderColor: 'rgba(29,200,255,0.2)', color: 'rgba(29,200,255,0.9)' }}>
        <div className="font-bold shrink-0">ℹ</div>
        <div>{t.payRates.infoNote}</div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-base font-bold text-white/70 uppercase tracking-widest mb-4">{t.payRates.standard}</h2>
          {renderTable(t.payRates.units,    PAY_RATES['units'])}
          {renderTable(t.payRates.building, PAY_RATES['building'])}
          {renderTable(t.payRates.hallway,  PAY_RATES['hallway'])}
        </section>

        <section>
          <h2 className="text-base font-bold text-white/70 uppercase tracking-widest mb-4">{t.payRates.clubhouse}</h2>
          {renderTable(t.payRates.ch150, CLUBHOUSE_RATES['150'])}
          {renderTable(t.payRates.ch120, CLUBHOUSE_RATES['120'])}
          {renderTable(t.payRates.ch80,  CLUBHOUSE_RATES['80'])}
        </section>

        <section>
          <h2 className="text-base font-bold text-white/70 uppercase tracking-widest mb-4">{t.payRates.combos}</h2>
          {renderTable(t.payRates.clh725, CLUB_HALLWAY_RATES['725'])}
          {renderTable(t.payRates.clh500, CLUB_HALLWAY_RATES['500'])}
        </section>

        <section>
          <h2 className="text-base font-bold text-white/70 uppercase tracking-widest mb-4">{t.payRates.other}</h2>
          {renderTable(t.payRates.lkq,    PAY_RATES['lkq'])}
          {renderTable(t.payRates.touchup, PAY_RATES['touchup'])}
        </section>
      </div>
    </div>
  );
}
