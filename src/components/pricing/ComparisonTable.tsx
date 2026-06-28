import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { BillingCadence } from './BillingToggle'
import type { Plan } from './PricingCards'

const TableCell: React.FC<{ ok: boolean; text?: React.ReactNode }> = ({ ok, text }) => (
  <div className="flex items-center gap-2">
    {ok ? <Check size={16} className="text-emerald-300" /> : <span className="w-4" />}
    {text ? <span className="text-sm text-slate-200/95">{text}</span> : null}
  </div>
)


export default function ComparisonTable({ plans, cadence }: { plans: Plan[]; cadence: BillingCadence }) {
  const starter = plans.find((p) => p.id === 'starter')
  const pro = plans.find((p) => p.id === 'professional')
  const enterprise = plans.find((p) => p.id === 'enterprise')

  const rows: {
    key:
      | 'aiDetection'
      | 'cameras'
      | 'accessLogs'
      | 'analytics'
      | 'emailAlerts'
      | 'smsAlerts'
      | 'apiAccess'
      | 'sla'
      | 'prioritySupport'
      | 'dataRetention'
      | 'deployment'
    label: string
    value: {
      starter: React.ReactNode
      pro: React.ReactNode
      enterprise: React.ReactNode
    }
  }[] = [
    {
      key: 'aiDetection',
      label: 'AI Detection',
      value: {
        starter: 'Basic motion detection',
        pro: 'Advanced anomaly + identity signals',
        enterprise: 'Custom models + tuned inference',
      },
    },
    {
      key: 'cameras',
      label: 'Cameras',
      value: {
        starter: 'Up to 2',
        pro: 'Up to 10',
        enterprise: 'Unlimited',
      },
    },
    {
      key: 'accessLogs',
      label: 'Access Logs',
      value: {
        starter: 'Live access logs',
        pro: 'Live + enriched identity context',
        enterprise: 'Unified audit-grade reporting',
      },
    },
    {
      key: 'analytics',
      label: 'Analytics',
      value: {
        starter: 'Basic dashboard',
        pro: 'Advanced analytics dashboard',
        enterprise: 'Custom analytics & reporting',
      },
    },
    {
      key: 'emailAlerts',
      label: 'Email Alerts',
      value: {
        starter: 'Included',
        pro: 'Included',
        enterprise: 'Included',
      },
    },
    {
      key: 'smsAlerts',
      label: 'SMS Alerts',
      value: {
        starter: '—',
        pro: 'Available (add-on)',
        enterprise: 'Available',
      },
    },
    {
      key: 'apiAccess',
      label: 'API Access',
      value: {
        starter: '—',
        pro: 'Limited integrations',
        enterprise: 'Full API access',
      },
    },
    {
      key: 'sla',
      label: 'SLA',
      value: {
        starter: '—',
        pro: 'Standard SLA',
        enterprise: 'Dedicated SLA',
      },
    },
    {
      key: 'prioritySupport',
      label: 'Priority Support',
      value: {
        starter: 'Community response',
        pro: 'Priority support included',
        enterprise: '24×7 support',
      },
    },
    {
      key: 'dataRetention',
      label: 'Data Retention',
      value: {
        starter: '30 days',
        pro: '90 days',
        enterprise: 'Custom retention window',
      },
    },
    {
      key: 'deployment',
      label: 'Enterprise Deployment',
      value: {
        starter: 'Cloud SaaS',
        pro: 'Cloud SaaS + integrations',
        enterprise: 'Dedicated infrastructure',
      },
    },
  ]

  return (
    <section className="mt-10 sm:mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur p-4 sm:p-6 overflow-x-auto"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-blue-200 text-xs font-semibold tracking-wider">FEATURE COMPARISON</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Everything you need to secure edge operations</h2>
              <p className="mt-3 text-slate-300/90 text-sm sm:text-base">
                Transparent capabilities across plans. Prices update with billing cadence.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-300/70" />
              {cadence === 'yearly' ? 'Yearly pricing selected' : 'Monthly pricing selected'}
            </div>
          </div>

          <div className="mt-5">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="py-4 pr-4 text-sm font-semibold text-slate-300/90">Feature</th>
                  {[starter, pro, enterprise].map((p) => (
                    <th key={p?.id} className="py-4 px-2">
                      <div className="min-w-[170px]">
                        <div className="text-white font-bold">{p?.name}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {p?.id === 'enterprise'
                            ? 'Contact'
                            : cadence === 'monthly'
                              ? `₹${p?.monthlyPriceINR}/mo`
                              : `₹${p?.yearlyPriceINR}/mo`}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-t border-white/5">
                    <td className="py-4 pr-4 text-sm text-slate-200/95 font-medium">{r.label}</td>
                    <td className="py-4 px-2">
                      <TableCell ok={r.value.starter !== '—'} text={r.value.starter} />
                    </td>
                    <td className="py-4 px-2">
                      <TableCell ok={r.value.pro !== '—'} text={r.value.pro} />
                    </td>
                    <td className="py-4 px-2">
                      <TableCell ok={r.value.enterprise !== '—'} text={r.value.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-500">Note: SMS and some integrations may require enablement depending on deployment.</p>
        </motion.div>
      </div>
    </section>
  )
}

