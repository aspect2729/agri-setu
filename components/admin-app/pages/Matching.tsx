"use client";

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, ChevronRight, Zap, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import type { NavContext } from '../nav';
import { useAdminData } from '../data-context';
import type { SupplyItem, DemandItem } from '../types';
import { matchDemand } from '@/lib/actions';

function MatchBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Matched: 'bg-[#E8F5EE] text-[#1B7A3D] border-[#DDE8E1]',
    'Partially Matched': 'bg-blue-50 text-blue-700 border-blue-100',
    Unmatched: 'bg-[#F7F8F5] text-[#5A7263] border-[#DDE8E1]',
    Shortage: 'bg-red-50 text-red-700 border-red-100',
    Surplus: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[status] ?? 'bg-[#F7F8F5] text-[#5A7263] border-[#DDE8E1]'}`}>
      {status === 'Shortage' && <TrendingDown size={9} />}
      {status === 'Surplus' && <TrendingUp size={9} />}
      {status === 'Matched' && <CheckCircle size={9} />}
      {status}
    </span>
  );
}

type MatchStep = 'workspace' | 'review' | 'confirm' | 'success';

interface ReviewTarget {
  supply: SupplyItem;
  demand: DemandItem;
}

export default function Matching({ navCtx }: { navCtx: NavContext }) {
  const { supplyItems, demandItems } = useAdminData();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<MatchStep>('workspace');
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [adjustedQty, setAdjustedQty] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [matchError, setMatchError] = useState<string | null>(null);

  const filteredSupply = supplyItems.filter(s => activeFilter === 'All' || s.matchStatus === activeFilter || (activeFilter === 'Partial' && s.matchStatus === 'Partially Matched'));
  const filteredDemand = demandItems.filter(d => activeFilter === 'All' || d.matchStatus === activeFilter || (activeFilter === 'Partial' && d.matchStatus === 'Partially Matched'));

  const unmatched = supplyItems.filter(s => s.matchStatus === 'Unmatched' || s.matchStatus === 'Shortage').length +
    demandItems.filter(d => d.matchStatus === 'Unmatched' || d.matchStatus === 'Shortage').length;

  function startReview(supply: SupplyItem, demand: DemandItem) {
    setMatchError(null);
    setReviewTarget({ supply, demand });
    setAdjustedQty(Math.min(supply.available, demand.requested));
    setStep('review');
  }

  function handleConfirm() {
    setMatchError(null);
    setStep('confirm');
  }

  function handleFinalConfirm() {
    if (!reviewTarget) return;
    setMatchError(null);
    startTransition(async () => {
      const result = await matchDemand(reviewTarget.demand.id);
      if (result.error) {
        setMatchError(result.error);
        return;
      }
      setStep('success');
      router.refresh();
    });
  }

  function handleContinue() {
    setStep('workspace');
    setReviewTarget(null);
    setMatchError(null);
  }

  const recommendations = useMemo(() => {
    return demandItems
      .filter(d => d.matchStatus === 'Unmatched' || d.matchStatus === 'Shortage')
      .map(demand => {
        const supply = supplyItems
          .filter(s => s.crop === demand.crop && s.available > 0)
          .sort((a, b) => b.available - a.available)[0];
        if (!supply) return null;
        const qty = Math.min(supply.available, demand.requested);
        const compatibility = Math.max(40, Math.round((qty / demand.requested) * 100));
        const reasons = [
          supply.quality.includes('A') ? 'Quality grade matches' : 'Usable quality grade',
          supply.freshness >= 80 ? 'Freshness excellent' : 'Freshness adequate',
          qty >= demand.requested ? 'Volume covers demand' : 'Partial volume available',
        ];
        return { supply, demand, compatibility, reasons };
      })
      .filter((r): r is NonNullable<typeof r> => r != null)
      .slice(0, 2);
  }, [supplyItems, demandItems]);

  if (step === 'review' && reviewTarget) {
    const { supply, demand } = reviewTarget;
    const price = demand.offeredPrice ?? 48;
    const valueEst = adjustedQty * price;
    return (
      <div className="max-w-[900px] mx-auto px-8 py-8">
        <div className="flex items-center gap-2 text-[13px] text-[#5A7263] mb-6">
          <button onClick={() => setStep('workspace')} className="hover:text-[#1A2E1E] font-medium">Matching</button>
          <ChevronRight size={14} />
          <span className="text-[#1A2E1E] font-medium">Review Match</span>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[#EEF1EE] mb-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 mb-8">
            <Zap size={20} className="text-[#22A357]" />
            <h1 className="text-[20px] font-semibold text-[#1A2E1E]" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
              Reviewing Match — {supply.crop}
            </h1>
          </div>

          <div className="grid grid-cols-5 gap-4 items-start">
            {/* Supply */}
            <div className="col-span-2 bg-[#E8F5EE] border border-[#DDE8E1] rounded-2xl p-5">
              <p className="text-[11px] font-semibold text-[#145C2E] uppercase tracking-wide mb-4">Available Supply</p>
              <p className="text-[18px] font-bold text-[#1B7A3D] mb-4">{supply.storeName}</p>
              {[
                { label: 'Crop', value: supply.crop },
                { label: 'Available', value: `${supply.available.toLocaleString()} kg` },
                { label: 'Quality', value: supply.quality },
                { label: 'Freshness', value: `${supply.freshness}%` },
              ].map(r => (
                <div key={r.label} className="flex justify-between py-2 border-b border-[#DDE8E1] last:border-0">
                  <span className="text-[12px] text-[#8FA898]">{r.label}</span>
                  <span className="text-[13px] font-semibold text-[#1B7A3D]">{r.value}</span>
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="col-span-1 flex flex-col items-center justify-center pt-12 gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1B7A3D] flex items-center justify-center">
                <ArrowRight size={20} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-[12px] font-semibold text-[#5A7263]">Match qty</p>
                <input
                  type="number"
                  value={adjustedQty}
                  onChange={e => setAdjustedQty(Number(e.target.value))}
                  className="mt-1 w-20 text-center text-[14px] font-bold text-[#1B7A3D] bg-[#E8F5EE] border border-[#DDE8E1] rounded-lg py-1 outline-none"
                />
                <p className="text-[11px] text-[#8FA898] mt-0.5">kg</p>
              </div>
            </div>

            {/* Demand */}
            <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mb-4">Buyer Demand</p>
              <p className="text-[18px] font-bold text-blue-900 mb-4">{demand.buyerName}</p>
              {[
                { label: 'Crop', value: demand.crop },
                { label: 'Requested', value: `${demand.requested.toLocaleString()} kg` },
                { label: 'Quality', value: demand.quality },
                { label: 'Order ID', value: demand.orderId },
              ].map(r => (
                <div key={r.label} className="flex justify-between py-2 border-b border-blue-100 last:border-0">
                  <span className="text-[12px] text-blue-500">{r.label}</span>
                  <span className="text-[13px] font-semibold text-blue-900">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expected value */}
          <div className="mt-6 bg-[#F7F8F5] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] text-[#5A7263] font-medium">Estimated Match Value</p>
              <p className="text-[11px] text-[#8FA898]">{adjustedQty.toLocaleString()} kg × ₹{price}/kg</p>
            </div>
            <p className="text-[24px] font-bold font-mono text-[#1B7A3D]" style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }}>
              ₹{valueEst.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-3 bg-[#1B7A3D] text-white text-[14px] font-semibold rounded-xl hover:bg-[#145C2E] transition-colors"
          >
            <CheckCircle size={16} /> Confirm Match
          </button>
          <button
            onClick={() => setStep('workspace')}
            className="px-5 py-3 bg-white border border-[#EEF1EE] text-[14px] font-medium text-[#5A7263] rounded-xl hover:bg-[#F7F8F5] transition-colors"
          >
            Back
          </button>
          <button className="px-5 py-3 text-[14px] font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
            Reject Match
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirm' && reviewTarget) {
    const { supply, demand } = reviewTarget;
    return (
      <div className="max-w-[560px] mx-auto px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 border border-[#EEF1EE] w-full text-center" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={24} className="text-amber-500" />
          </div>
          <h2 className="text-[20px] font-semibold text-[#1A2E1E] mb-2">Confirm this match?</h2>
          <p className="text-[14px] text-[#5A7263] mb-6">
            You are about to match <strong>{adjustedQty.toLocaleString()} kg {supply.crop}</strong> from{' '}
            <strong>{supply.storeName}</strong> to <strong>{demand.buyerName}</strong>.
            This action will update the order and inventory records.
          </p>
          {matchError && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5 text-left">{matchError}</p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleFinalConfirm}
              disabled={pending}
              className="px-6 py-2.5 bg-[#1B7A3D] text-white text-[14px] font-semibold rounded-xl hover:bg-[#145C2E] transition-colors disabled:opacity-60"
            >
              {pending ? 'Matching…' : 'Yes, confirm match'}
            </button>
            <button
              onClick={() => setStep('review')}
              className="px-6 py-2.5 bg-white border border-[#EEF1EE] text-[14px] font-medium text-[#5A7263] rounded-xl hover:bg-[#F7F8F5] transition-colors"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success' && reviewTarget) {
    const { supply, demand } = reviewTarget;
    return (
      <div className="max-w-[560px] mx-auto px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 border border-[#EEF1EE] w-full text-center" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] border border-[#DDE8E1] flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={26} className="text-[#1B7A3D]" />
          </div>
          <p className="text-[12px] font-semibold text-[#22A357] uppercase tracking-widest mb-2">Match Confirmed</p>
          <h2 className="text-[22px] font-semibold text-[#1A2E1E] mb-1" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
            {supply.crop} — {adjustedQty.toLocaleString()} kg
          </h2>
          <p className="text-[14px] text-[#5A7263] mb-6">
            Supply and demand successfully linked.{' '}
            <strong>{supply.storeName}</strong> → <strong>{demand.buyerName}</strong>
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navCtx.navigateTo('orders')} className="px-5 py-2.5 bg-[#1B7A3D] text-white text-[13px] font-semibold rounded-xl hover:bg-[#145C2E] transition-colors">
              View Order
            </button>
            <button onClick={() => navCtx.navigateTo('stores', { storeId: supply.storeId })} className="px-5 py-2.5 bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] rounded-xl hover:bg-[#F7F8F5] transition-colors">
              View Store
            </button>
            <button onClick={handleContinue} className="px-5 py-2.5 text-[13px] font-semibold text-[#145C2E] rounded-xl hover:bg-[#E8F5EE] transition-colors">
              Continue Matching →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1A2E1E] mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Supply ↔ Demand</h1>
          <p className="text-[14px] text-[#5A7263]">Match available produce supply to buyer demand across all stores</p>
        </div>
        {unmatched > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-[13px] font-medium text-amber-700">
            <AlertTriangle size={14} />
            {unmatched} items need attention
          </div>
        )}
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Matched', count: supplyItems.filter(s => s.matchStatus === 'Matched').length, color: 'text-[#1B7A3D]', bg: 'bg-[#E8F5EE] border-[#DDE8E1]' },
          { label: 'Partial', count: supplyItems.filter(s => s.matchStatus === 'Partially Matched').length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Unmatched', count: supplyItems.filter(s => s.matchStatus === 'Unmatched').length, color: 'text-[#5A7263]', bg: 'bg-[#F7F8F5] border-[#DDE8E1]' },
          { label: 'Shortage', count: demandItems.filter(d => d.matchStatus === 'Shortage').length, color: 'text-red-700', bg: 'bg-red-50 border-red-100' },
          { label: 'Surplus', count: supplyItems.filter(s => s.matchStatus === 'Surplus').length, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setActiveFilter(activeFilter === s.label ? 'All' : s.label)}
            className={`${s.bg} rounded-xl p-4 border text-left transition-all ${activeFilter === s.label ? 'ring-2 ring-[#1B7A3D]' : ''}`}
          >
            <p className={`text-[22px] font-bold font-mono ${s.color}`} style={{ fontFamily: 'JetBrains Mono' }}>{s.count}</p>
            <p className="text-[12px] font-medium text-[#5A7263] mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Recommended matches */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE] mb-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Zap size={16} className="text-[#22A357]" />
            <h2 className="text-[15px] font-semibold text-[#1A2E1E]">Recommended Matches</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="bg-[#F7F8F5] border border-[#EEF1EE] rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[13px] font-bold text-[#1A2E1E]">{rec.supply.crop} — {Math.min(rec.supply.available, rec.demand.requested).toLocaleString()} kg</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-16 h-1.5 bg-[#F7F8F5] rounded-full overflow-hidden">
                        <div className="h-full bg-[#22A357] rounded-full" style={{ width: `${rec.compatibility}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#145C2E]">{rec.compatibility}% compatible</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#5A7263] mb-3">
                  <span className="font-medium text-[#1B7A3D]">{rec.supply.storeName}</span>
                  <ArrowRight size={11} />
                  <span className="font-medium text-blue-700">{rec.demand.buyerName}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {rec.reasons.map(r => (
                    <span key={r} className="text-[10px] font-medium bg-[#E8F5EE] text-[#145C2E] px-2 py-0.5 rounded-full">{r}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startReview(rec.supply, rec.demand)}
                    className="flex-1 py-2 bg-[#1B7A3D] text-white text-[12px] font-semibold rounded-lg hover:bg-[#145C2E] transition-colors"
                  >
                    Review Match
                  </button>
                  <button
                    disabled={pending}
                    onClick={() => {
                      setReviewTarget({ supply: rec.supply, demand: rec.demand });
                      setAdjustedQty(Math.min(rec.supply.available, rec.demand.requested));
                      startTransition(async () => {
                        const result = await matchDemand(rec.demand.id);
                        if (result.error) {
                          setMatchError(result.error);
                          setStep('confirm');
                          return;
                        }
                        setStep('success');
                        router.refresh();
                      });
                    }}
                    className="flex-1 py-2 bg-[#E8F5EE] text-[#1B7A3D] text-[12px] font-semibold rounded-lg hover:bg-[#DDE8E1] transition-colors border border-[#DDE8E1] disabled:opacity-60"
                  >
                    Quick Confirm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main workspace */}
      <div className="grid grid-cols-11 gap-4">
        {/* Supply */}
        <div className="col-span-5 bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="px-5 py-4 border-b border-[#F7F8F5] bg-[#E8F5EE]">
            <p className="text-[11px] font-bold text-[#145C2E] uppercase tracking-wider mb-0.5">Available Supply</p>
            <p className="text-[12px] text-[#8FA898]">From White Stores</p>
          </div>
          <div className="divide-y divide-[#F7F8F5]">
            {filteredSupply.map(s => (
                <div key={s.id} className="px-5 py-4 hover:bg-[#F7F8F5] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[14px] font-semibold text-[#1A2E1E]">{s.crop}</p>
                      <p className="text-[12px] text-[#5A7263]">{s.storeName}</p>
                    </div>
                    <MatchBadge status={s.matchStatus} />
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-[#5A7263]">
                    <span className="font-semibold font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{s.available.toLocaleString()} kg</span>
                    <span>{s.quality}</span>
                    <span>Freshness: <span className={`font-semibold ${s.freshness > 80 ? 'text-green-600' : s.freshness > 65 ? 'text-amber-600' : 'text-red-600'}`}>{s.freshness}%</span></span>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Center connector */}
        <div className="col-span-1 flex flex-col items-center justify-center gap-3">
          {filteredSupply.map((s, i) => (
            <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center" style={{
              background: s.matchStatus === 'Matched' ? '#E8F5EE' :
                          s.matchStatus === 'Partially Matched' ? '#EFF6FF' : '#F7F8F5'
            }}>
              <ArrowRight size={13} style={{
                color: s.matchStatus === 'Matched' ? '#1B7A3D' :
                       s.matchStatus === 'Partially Matched' ? '#E9A23B' : '#DDE8E1'
              }} />
            </div>
          ))}
        </div>

        {/* Demand */}
        <div className="col-span-5 bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="px-5 py-4 border-b border-[#F7F8F5] bg-blue-50">
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Buyer Demand</p>
            <p className="text-[12px] text-blue-500">Open purchase orders</p>
          </div>
          <div className="divide-y divide-[#F7F8F5]">
            {filteredDemand.map(d => (
              <div key={d.id} className="px-5 py-4 hover:bg-[#F7F8F5] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[14px] font-semibold text-[#1A2E1E]">{d.crop}</p>
                    <p className="text-[12px] text-[#5A7263]">{d.buyerName}</p>
                  </div>
                  <MatchBadge status={d.matchStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[12px] text-[#5A7263]">
                    <span className="font-semibold font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{d.requested.toLocaleString()} kg</span>
                    <span>{d.quality}</span>
                    <span className="font-mono text-[11px] text-[#8FA898]" style={{ fontFamily: 'JetBrains Mono' }}>{d.orderId}</span>
                  </div>
                  {(d.matchStatus === 'Unmatched' || d.matchStatus === 'Shortage') && (
                    <button
                      onClick={() => {
                        const matchSupply = supplyItems.find(s => s.crop === d.crop && (s.matchStatus === 'Unmatched' || s.matchStatus === 'Surplus'));
                        if (matchSupply) startReview(matchSupply, d);
                      }}
                      className="text-[11px] font-semibold text-[#145C2E] hover:text-[#1B7A3D] flex items-center gap-1 transition-colors"
                    >
                      Match <ArrowRight size={10} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
