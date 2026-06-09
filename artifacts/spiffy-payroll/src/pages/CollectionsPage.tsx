import React, { useState } from 'react';
import { INVOICES } from '@/data/invoices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Mail, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function CollectionsPage() {
  const [invoices, setInvoices] = useState(INVOICES.sort((a, b) => b.amount - a.amount));
  const [filter, setFilter] = useState<'All' | '7+ Days' | '14+ Days' | '30+ Days'>('All');
  const [search, setSearch] = useState('');
  const [confirmPaidId, setConfirmPaidId] = useState<string | null>(null);

  const handleMarkPaid = () => {
    if (confirmPaidId) {
      setInvoices(invoices.filter(i => i.id !== confirmPaidId));
      toast.success('Invoice marked as paid');
      setConfirmPaidId(null);
    }
  };

  const handleSendReminder = (client: string) => {
    toast.success(`Reminder sent to ${client}!`);
  };

  const filteredInvoices = invoices.filter(i => {
    const matchSearch = i.client.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    
    if (filter === 'All') return true;
    if (typeof i.daysLate !== 'number') return false;
    
    if (filter === '7+ Days') return i.daysLate >= 7;
    if (filter === '14+ Days') return i.daysLate >= 14;
    if (filter === '30+ Days') return i.daysLate >= 30;
    
    return true;
  });

  const totalPastDue = invoices
    .filter(i => typeof i.daysLate === 'number' && i.daysLate > 0)
    .reduce((sum, i) => sum + i.amount, 0);

  const pastDueCount = invoices.filter(i => typeof i.daysLate === 'number' && i.daysLate > 0).length;

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D1B4E]">Outstanding Collections</h1>
        <p className="text-gray-500">${totalPastDue.toLocaleString()} across {pastDueCount} invoices</p>
      </div>

      <div className="bg-red-600 text-white rounded-xl p-4 mb-6 flex items-start gap-3 shadow-md">
        <AlertTriangle className="shrink-0 mt-1" />
        <div>
          <div className="font-bold text-lg mb-1">{pastDueCount} invoices are past due</div>
          <div className="opacity-90">Total outstanding: ${totalPastDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm text-center">
          <div className="text-red-600 text-sm font-medium mb-1">Total Past Due</div>
          <div className="text-2xl font-bold text-red-700">${totalPastDue.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-orange-100 rounded-xl p-4 shadow-sm text-center">
          <div className="text-orange-600 text-sm font-medium mb-1">Invoices</div>
          <div className="text-2xl font-bold text-orange-700">{pastDueCount}</div>
        </div>
        <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm text-center">
          <div className="text-red-600 text-sm font-medium mb-1">Oldest</div>
          <div className="text-2xl font-bold text-red-700">21+ days</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex bg-gray-200 rounded-lg p-1 shrink-0 overflow-x-auto">
          {['All', '7+ Days', '14+ Days', '30+ Days'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-white text-[#0D1B4E] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            type="text" 
            placeholder="Search client name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 min-h-[44px] bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Invoice #</th>
                <th className="p-4 font-semibold">Due Date</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((inv, idx) => {
                const isLate = typeof inv.daysLate === 'number' && inv.daysLate > 0;
                let badgeClass = "bg-blue-100 text-blue-700";
                let badgeText = "Upcoming";
                
                if (isLate) {
                  badgeText = `${inv.daysLate} days late`;
                  if (inv.daysLate >= 15) badgeClass = "bg-red-100 text-red-700 font-bold";
                  else if (inv.daysLate >= 8) badgeClass = "bg-orange-100 text-orange-700";
                  else badgeClass = "bg-yellow-100 text-yellow-800";
                }

                return (
                  <tr key={inv.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="p-4 font-medium text-[#1A1A2A]">{inv.client}</td>
                    <td className="p-4 text-gray-500">#{inv.invoiceNum}</td>
                    <td className="p-4 text-gray-600">{format(parseISO(inv.dueDate), 'MMM d, yyyy')}</td>
                    <td className="p-4 font-bold text-[#0D1B4E]">${inv.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLate && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-gray-600 border-gray-300 hover:bg-gray-100"
                            onClick={() => handleSendReminder(inv.client)}
                            title="Send Reminder"
                          >
                            <Mail size={16} />
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          className="bg-[#16A34A] hover:bg-green-700 text-white"
                          onClick={() => setConfirmPaidId(inv.id)}
                          title="Mark Paid"
                        >
                          <Check size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && (
            <div className="p-8 text-center text-gray-500">No invoices match your filters.</div>
          )}
        </div>
      </div>

      <div className="mt-8 border-2 border-[#1DC8FF] bg-blue-50 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-[#0D1B4E] text-lg mb-2">Recovery Opportunity</h3>
        <p className="text-gray-700 mb-3">
          Setting up automated follow-up in Keap could recover <span className="font-bold">${(totalPastDue * 0.5).toLocaleString()}–${(totalPastDue * 0.75).toLocaleString()}</span> of this balance within 30 days without manual effort.
        </p>
        <button className="text-[#2471C8] font-bold hover:underline">
          Talk to Ryan Cole to set this up &rarr;
        </button>
      </div>

      <ConfirmDialog
        open={!!confirmPaidId}
        onOpenChange={(open) => !open && setConfirmPaidId(null)}
        title="Mark Invoice as Paid?"
        description="This will remove the invoice from the collections list."
        confirmLabel="Mark as Paid"
        onConfirm={handleMarkPaid}
        variant="success"
      />
    </div>
  );
}