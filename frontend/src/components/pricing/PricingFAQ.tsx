import React, { useId, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

type FAQItem = { q: string; a: string }

const FAQRow: React.FC<{ item: FAQItem; open: boolean; onToggle: () => void }> = ({ item, open, onToggle }) => {
  const contentId = useId()

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className="text-white font-semibold text-sm sm:text-base">{item.q}</span>
        <motion.span
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="text-cyan-200"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="px-5 sm:px-6 pb-5 text-slate-300/95 text-sm sm:text-base leading-relaxed">
              {item.a}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default function PricingFAQ() {
  const items: FAQItem[] = useMemo(
    () => [
      { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time. Your service remains active until the end of the billing period.' },
      { q: 'Can I upgrade later?', a: 'Absolutely. Upgrade from Starter to Professional or Enterprise whenever you need more cameras, users, or advanced analytics. Changes take effect immediately.' },
      { q: 'Is my data encrypted?', a: 'Yes. Sentinel Edge AI uses encrypted transport and encrypted storage for audit-grade logs. Encryption is enforced across the platform.' },
      { q: 'Do you offer Enterprise deployment?', a: 'Yes. Enterprise plans include dedicated infrastructure and can support stricter deployment requirements and SLAs for security teams.' },
      { q: 'Can I self-host?', a: 'For Enterprise, we support dedicated infrastructure options and controlled deployment paths depending on your compliance needs.' },
      { q: 'Do you support on-premise installation?', a: 'We can support on-premise options for Enterprise engagements. Contact Sales to discuss integration, data residency, and infrastructure constraints.' },
    ],
    [],
  )

  const [openIndex, setOpenIndex] = useState<number>(1)

  return (
    <section className="mt-10 sm:mt-14 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-blue-200 text-xs font-semibold tracking-wider">FAQ</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Answers for security teams</h2>
          <p className="mt-3 text-slate-300/90 text-sm sm:text-base">
            Clear and direct guidance for pricing, security, and deployment.
          </p>
        </div>

        <div className="mt-7 grid gap-3">
          {items.map((it, idx) => (
            <FAQRow
              key={it.q}
              item={it}
              open={openIndex === idx}
              onToggle={() => setOpenIndex((prev) => (prev === idx ? -1 : idx))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

