import React, { useState } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Tag, ShieldCheck, CheckCircle2, RotateCcw, AlertTriangle, FileText, ArrowUpRight } from 'lucide-react';
import { SaleRecord } from '../../types';

interface SalesAnalyticsSectionProps {
  salesRecords: SaleRecord[];
  currencySymbol: string;
}

export const SalesAnalyticsSection: React.FC<SalesAnalyticsSectionProps> = ({
  salesRecords,
  currencySymbol,
}) => {
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | '90days' | 'alltime'>('alltime');

  // Filter sales based on status and time
  const completedSales = salesRecords.filter((s) => s.status === 'Completed');
  const refundedSales = salesRecords.filter((s) => s.status === 'Refunded');
  const pendingSales = salesRecords.filter((s) => s.status === 'Pending');

  const totalRevenue = completedSales.reduce((sum, s) => sum + s.amount, 0);
  const totalPurchases = completedSales.length;
  const averageOrderValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;
  const totalRefundedAmount = refundedSales.reduce((sum, s) => sum + s.amount, 0);

  // Breakdown by license tier
  const licenseBreakdown: Record<string, { count: number; total: number }> = {};
  completedSales.forEach((sale) => {
    const key = sale.licenseType || 'Standard License';
    if (!licenseBreakdown[key]) {
      licenseBreakdown[key] = { count: 0, total: 0 };
    }
    licenseBreakdown[key].count += 1;
    licenseBreakdown[key].total += sale.amount;
  });

  return (
    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              FEATURE 40 · SALES ANALYTICS
            </span>
          </div>
          <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight mt-0.5">
            REVENUE & TRANSACTION AUDIT
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            Verified financial receipts, average order values, and product license distributions.
          </p>
        </div>

        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          {(['7days', '30days', '90days', 'alltime'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                timeFilter === filter
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {filter === '7days' ? '7 Days' : filter === '30days' ? '30 Days' : filter === '90days' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Financial KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-zinc-900/60 border border-emerald-500/30 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Total Net Revenue</span>
          <div className="text-2xl font-mono font-black text-emerald-400">
            {currencySymbol}{totalRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-500">Confirmed Escrow Payouts</span>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Number of Purchases</span>
          <div className="text-2xl font-mono font-black text-white">
            {totalPurchases}
          </div>
          <span className="text-[10px] text-zinc-500">{completedSales.length} Completed Orders</span>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Average Order Value</span>
          <div className="text-2xl font-mono font-black text-purple-300">
            {currencySymbol}{averageOrderValue.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-500">Per Customer Checkout</span>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Refunded Volume</span>
          <div className="text-2xl font-mono font-black text-zinc-400">
            {currencySymbol}{totalRefundedAmount.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">{refundedSales.length} Total Refunds</span>
        </div>
      </div>

      {/* License Breakdown Table */}
      {Object.keys(licenseBreakdown).length > 0 && (
        <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3">
          <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            License Type Distribution
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(licenseBreakdown).map(([tierName, data]) => (
              <div key={tierName} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-purple-300 block truncate">{tierName}</span>
                <div className="text-base font-mono font-black text-white">
                  {currencySymbol}{data.total.toFixed(2)}
                </div>
                <div className="text-[10px] text-zinc-500 font-medium">
                  {data.count} {data.count === 1 ? 'sale' : 'sales'} ({totalRevenue > 0 ? ((data.total / totalRevenue) * 100).toFixed(0) : 0}% of revenue)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Transactions History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Confirmed Transaction Ledger ({completedSales.length})
          </h4>
          <span className="text-[10px] font-mono text-zinc-500">REAL TRANSACTION RECORDS</span>
        </div>

        {completedSales.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {completedSales.map((sale) => (
              <div
                key={sale.id}
                className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white truncate">{sale.beatTitle}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-500/20 font-mono font-bold">
                      {sale.licenseType}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                    Order Ref: #{sale.orderId} · {sale.date}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-sm font-black text-emerald-400">
                    +{currencySymbol}{sale.amount.toFixed(2)}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Settled & Paid</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-zinc-900/30 border border-zinc-850 rounded-2xl space-y-2">
            <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">No Sales Yet</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              When customers complete beat license purchases through your connected PayPal gateway, confirmed transactions will be recorded here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
