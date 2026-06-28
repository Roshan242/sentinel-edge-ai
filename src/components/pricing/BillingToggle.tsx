import { motion } from 'framer-motion'


export type BillingCadence = 'monthly' | 'yearly'

export default function BillingToggle({
  value,
  onChange,
}: {
  value: BillingCadence
  onChange: (v: BillingCadence) => void
}) {
  const isYearly = value === 'yearly'

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold text-base">Billing</p>
          <p className="text-slate-300/90 text-sm">Choose your subscription cadence.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange('monthly')}
            className={
              'px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ' +
              (!isYearly
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-200'
                : 'border-white/10 bg-white/[0.02] text-slate-200 hover:border-white/20')
            }
            aria-pressed={!isYearly}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() => onChange('yearly')}
            className={
              'relative px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ' +
              (isYearly
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200'
                : 'border-white/10 bg-white/[0.02] text-slate-200 hover:border-white/20')
            }
            aria-pressed={isYearly}
          >
            <span className="absolute -top-2 right-1 bg-cyan-400/15 border border-cyan-300/30 text-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Save 20%
            </span>
            Yearly
          </button>
        </div>
      </div>

      {/* Animated switch */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-300/90">Selected plan</p>
            <div className="mt-1 flex items-center gap-2">
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-300 to-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.4)]"
                animate={{ scale: isYearly ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 18 }}
              />
              <p className="text-white font-semibold">
                {isYearly ? 'Yearly (20% off)' : 'Monthly'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-200">{isYearly ? '12 mo' : '1 mo'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

