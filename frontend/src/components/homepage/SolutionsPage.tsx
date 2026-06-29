import React from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Building2,
  Users,
  Factory,
  Heart,
  ScanEye,
  Lock,
  Fingerprint,
  Cpu,
  Network,
  Workflow,
  ArrowRight,
  Star,
  Layers,
  Globe,
  CheckCircle2,
  Zap,
  KeyRound,
} from 'lucide-react'

const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`min-h-screen bg-[#020817] text-white overflow-x-hidden ${className ?? ''}`}>{children}</div>
)

const GlassCard: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div
    className={
      'backdrop-blur-[10px] bg-white/5 border border-white/10 rounded-3xl shadow-[0_0_0_1px_rgba(59,130,246,0.15)] ' +
      (className ?? '')
    }
  >
    {children}
  </div>
)

const SectionHeading: React.FC<{ eyebrow: string; title: string; subtitle: string }> = ({
  eyebrow,
  title,
  subtitle,
}) => (
  <div className="max-w-3xl">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
      {eyebrow}
    </div>
    <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
    <p className="mt-3 text-slate-300/90 text-base md:text-lg leading-relaxed">{subtitle}</p>
  </div>
)

type SolutionCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  bullets: string[]
}

const SolutionCard: React.FC<SolutionCardProps> = ({ icon, title, description, bullets }) => (
  <GlassCard className="h-full">
    <div className="p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 border border-blue-500/25 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
          <p className="mt-1 text-slate-300/90 text-sm md:text-base leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="grid gap-2">
          {bullets.map((b) => (
            <div key={b} className="flex items-start gap-2 text-sm text-slate-200/95">
              <CheckCircle2 className="mt-0.5 text-emerald-300" size={16} />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </GlassCard>
)

const WorkflowStep: React.FC<{
  step: string
  title: string
  description: string
  index: number
}> = ({ step, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay: index * 0.06 }}
    className="h-full"
  >
    <GlassCard className="h-full">
      <div className="p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <Workflow className="text-blue-200" size={18} />
            </div>
            <p className="text-xs font-semibold text-blue-200/90 tracking-wider">{step}</p>
          </div>
        </div>
        <h3 className="mt-3 text-lg md:text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-slate-300/90 text-sm md:text-base leading-relaxed">{description}</p>
      </div>
    </GlassCard>
  </motion.div>
)

const ProblemRow: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="flex items-start gap-4">
    <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-base md:text-lg">{title}</h3>
      <p className="mt-1 text-slate-300/90 text-sm md:text-base leading-relaxed">{description}</p>
    </div>
  </div>
)

export default function SolutionsPage() {
  return (
    <PageContainer>
      {/* Anchor for LandingPage navbar */}
      <section id="solutions" className="pt-24 pb-10 sm:pb-14">
        {/* Background effects */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(34,197,94,0.10)_0%,_transparent_60%)',
          }}
        />

        <div
          className="fixed inset-0 -z-10 pointer-events-none opacity-[0.25]"
          style={{
            backgroundImage:
              'linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* HERO */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs sm:text-sm"
              >
                <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                Solutions for enterprise-grade security operations
              </motion.div>

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                Protect <span className="text-blue-300">people</span>, <span className="text-cyan-200">assets</span>, and{' '}
                <span className="text-violet-200">critical infrastructure</span>
              </h1>

              <p className="mt-4 text-slate-300/95 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl">
                Sentinel Edge AI delivers on-device intelligence, secure identity, and real-time response workflows—so your security
                teams can detect, verify, and act with confidence.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#cta"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold flex items-center justify-center gap-2 border border-blue-400/20"
                >
                  Request a Demo
                  <ArrowRight size={18} />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#industry"
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 font-semibold flex items-center justify-center gap-2 text-slate-200"
                >
                  Explore Solutions
                  <span className="w-2 h-2 rounded-full bg-blue-300" />
                </motion.a>
              </div>

              <div className="mt-8 grid sm:grid-cols-3 gap-3">
                {[
                  { k: 'Edge-first', v: 'Low-latency detection' },
                  { k: 'Secure identity', v: 'Biometric + access control' },
                  { k: 'Actionable', v: 'Workflow-driven response' },
                ].map((it) => (
                  <GlassCard key={it.k} className="p-4">
                    <p className="text-xs font-semibold text-blue-200">{it.k}</p>
                    <p className="mt-1 text-sm text-slate-300/95">{it.v}</p>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* HERO PREVIEW */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <GlassCard className="overflow-hidden">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                          <Shield className="text-blue-200" size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Security Operations View</p>
                          <p className="text-xs text-slate-400 mt-0.5">Real-time intelligence • Unified workflows</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs font-semibold">
                        Live
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {[
                        { icon: <ScanEye size={18} />, label: 'Detections', value: '24/7' },
                        { icon: <Lock size={18} />, label: 'Verification', value: 'Secure' },
                        { icon: <Network size={18} />, label: 'Integration', value: 'APIs' },
                        { icon: <Cpu size={18} />, label: 'Edge compute', value: 'On-site' },
                      ].map((s) => (
                        <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-4 h-full">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-200">{s.icon}</span>
                            <p className="text-xs text-slate-300/90">{s.label}</p>
                          </div>
                          <p className="mt-2 text-lg font-bold">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1220]/60 p-4 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Fingerprint size={18} className="text-cyan-200" />
                          <p className="text-sm font-semibold">Identity & Access Signals</p>
                        </div>
                        <div className="text-xs text-slate-400">Last 60 minutes</div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                          { t: 'Verified', c: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-200' },
                          { t: 'Anomaly', c: 'bg-amber-500/15 border-amber-500/25 text-amber-200' },
                          { t: 'Blocked', c: 'bg-red-500/15 border-red-500/25 text-red-200' },
                        ].map((x) => (
                          <div key={x.t} className={`rounded-xl border p-3 ${x.c}`}>
                            <p className="text-xs font-semibold">{x.t}</p>
                            <p className="mt-1 text-lg font-bold">{x.t === 'Verified' ? '128' : x.t === 'Anomaly' ? '9' : '3'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
                <div className="absolute -bottom-8 -right-10 w-28 h-28 rounded-full bg-cyan-400/10 blur-xl pointer-events-none" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* INDUSTRY SOLUTIONS */}
      </section>

      <section id="industry" className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="INDUSTRY SOLUTIONS"
            title="Deployment-ready security for every environment"
            subtitle="Choose the industry profile closest to your operations. Each solution is optimized for edge intelligence, access verification, and audit-grade reporting."
          />

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 auto-rows-fr">
            <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SolutionCard
                icon={<Building2 className="text-blue-200" size={22} />}
                title="Enterprise Security"
                description="Unified monitoring across campuses, offices, and critical zones with policy-based access verification."
                bullets={[
                  'Multi-site visibility with consolidated risk scoring',
                  'Role-based alerts and audit trails',
                  'Edge processing for privacy-sensitive environments',
                ]}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <SolutionCard
                icon={<Users className="text-cyan-200" size={22} />}
                title="Educational Institutions"
                description="Protect students, staff, and facilities with verified entry signals and safety workflows."
                bullets={[
                  'Visitor verification and controlled access',
                  'Rapid incident workflows for security teams',
                  'Compliance-ready logs and incident timelines',
                ]}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SolutionCard
                icon={<Factory className="text-violet-200" size={22} />}
                title="Industrial Facilities"
                description="Guard high-value assets and regulated processes with low-latency edge detection."
                bullets={[
                  'Perimeter and zone-based threat detection',
                  'Actionable alerts with verified identity context',
                  'Resilient operation with offline-capable edge logic',
                ]}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <SolutionCard
                icon={<Heart className="text-emerald-200" size={22} />}
                title="Healthcare Security"
                description="Secure access for patients and staff while supporting privacy and rapid response needs."
                bullets={[
                  'Visitor & staff verification workflows',
                  'Minimized data exposure with edge-first analytics',
                  'Incident reporting designed for fast escalation',
                ]}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SolutionCard
                icon={<Building2 className="text-blue-200" size={22} />}
                title="Smart Buildings"
                description="Integrate identity, safety, and monitoring across entrances, corridors, and shared spaces."
                bullets={[
                  'Access verification across devices and zones',
                  'Operational insights for building management',
                  'Event-driven reporting and alert routing',
                ]}
              />
            </motion.div>

            <motion.div className="hidden lg:block" />
          </div>
        </div>
      </section>

      {/* PROBLEMS WE SOLVE */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="PROBLEMS WE SOLVE"
            title="Turn noisy alerts into trusted decisions"
            subtitle="Security teams shouldn’t spend hours triaging false positives. Sentinel Edge AI reduces friction with on-device intelligence, verification, and clear workflows."
          />

          <div className="mt-8 grid lg:grid-cols-2 gap-4 lg:gap-6">
            <GlassCard className="p-5 md:p-6">
              <div className="space-y-6">
                <ProblemRow
                  icon={<Zap size={18} className="text-blue-200" />}
                  title="Alert overload"
                  description="Streamline incident queues using edge inference and confidence scoring so teams focus on verified threats."
                />
                <ProblemRow
                  icon={<Fingerprint size={18} className="text-cyan-200" />}
                  title="Identity gaps"
                  description="Require secure verification for sensitive areas with consistent biometric and access signals."
                />
                <ProblemRow
                  icon={<KeyRound size={18} className="text-violet-200" />}
                  title="Slow response cycles"
                  description="Route incidents to the right role with workflow-driven context and audit-grade event timelines."
                />
              </div>
            </GlassCard>

            <GlassCard className="p-5 md:p-6">
              <div className="space-y-6">
                <ProblemRow
                  icon={<Layers size={18} className="text-emerald-200" />}
                  title="Fragmented systems"
                  description="Unify signals across cameras, access control, and security tools into one operational view."
                />
                <ProblemRow
                  icon={<Lock size={18} className="text-blue-200" />}
                  title="Privacy and compliance pressure"
                  description="Edge-first processing reduces data exposure while improving traceability and reporting."
                />
                <ProblemRow
                  icon={<Globe size={18} className="text-cyan-200" />}
                  title="Multi-site complexity"
                  description="Standardize deployments across campuses and facilities with consistent policies and repeatable playbooks."
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* SOLUTION WORKFLOW */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="SOLUTION WORKFLOW"
            title="From detection to action—without guesswork"
            subtitle="A production-grade workflow that connects intelligent edge signals to human response."
          />

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 auto-rows-fr">
            <WorkflowStep index={0} step="01" title="Edge Detection" description="On-device analysis identifies anomalies, objects, and access-related events with low latency." />
            <WorkflowStep index={1} step="02" title="Secure Verification" description="Verify identity and context using consistent biometric and access control signals." />
            <WorkflowStep index={2} step="03" title="Risk Scoring" description="Confidence-based scoring reduces false positives and prioritizes what matters most." />
            <WorkflowStep index={3} step="04" title="Automated Response" description="Trigger incident workflows, alert routing, and audit trails designed for fast, accountable action." />
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="WHY SENTINEL EDGE AI"
                title="Enterprise-grade security engineering"
                subtitle="Built for modern security operations: secure, observable, and scalable—without sacrificing speed."
              />

              <div className="mt-6 space-y-3">
                {[
                  { icon: <Star size={16} className="text-yellow-200" />, text: 'Premium glassmorphism UI with consistent spacing and responsive layout' },
                  { icon: <CheckCircle2 size={16} className="text-emerald-200" />, text: 'Workflow-driven alerts with verification context' },
                  { icon: <CheckCircle2 size={16} className="text-emerald-200" />, text: 'Audit-grade reporting and incident timelines' },
                ].map((x) => (
                  <div key={x.text} className="flex items-start gap-2">
                    <div className="mt-0.5">{x.icon}</div>
                    <p className="text-slate-300/95 text-sm leading-relaxed">{x.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <GlassCard className="p-5 md:p-6">
                <div className="grid sm:grid-cols-2 gap-4 md:gap-5 auto-rows-fr">
                  {[
                    {
                      icon: <Shield size={18} className="text-blue-200" />,
                      title: 'Security-first design',
                      desc: 'Least-privilege workflows and secure identity signals for sensitive zones.',
                    },
                    {
                      icon: <Cpu size={18} className="text-cyan-200" />,
                      title: 'Edge performance',
                      desc: 'Low-latency detection supports real-time operations even under constrained connectivity.',
                    },
                    {
                      icon: <Network size={18} className="text-violet-200" />,
                      title: 'Integrations ready',
                      desc: 'APIs and interoperable event streams to fit existing security stacks.',
                    },
                    {
                      icon: <Lock size={18} className="text-emerald-200" />,
                      title: 'Privacy-aware analytics',
                      desc: 'Minimize exposure with edge-first inference and traceable reporting.',
                    },
                  ].map((f) => (
                    <div key={f.title} className="rounded-2xl bg-white/5 border border-white/10 p-5 h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          {f.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-base md:text-lg">{f.title}</h3>
                          <p className="mt-1 text-slate-300/90 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-cyan-400/5 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Built for real security teams</p>
                      <p className="text-slate-300/90 text-sm mt-1">Less noise. More verified action. Consistent reporting across locations.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Layers size={18} className="text-blue-200" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Operational confidence</p>
                        <p className="text-lg font-bold">↑</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-10 sm:py-14 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="overflow-hidden">
            <div className="relative">
              <div
                className="absolute inset-0 opacity-90 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.25)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(34,197,94,0.15)_0%,_transparent_60%)',
                }}
              />
              <div className="relative p-6 sm:p-8">
                <div className="grid lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs">
                      <Shield size={14} className="text-blue-200" />
                      Ready for enterprise rollout
                    </div>
                    <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">See Sentinel Edge AI in action</h2>
                    <p className="mt-3 text-slate-300/95 text-base md:text-lg leading-relaxed max-w-2xl">
                      Get a tailored walkthrough for your industry—edge detection, secure verification, and workflow-driven response.
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href="#"
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold border border-blue-400/20 flex items-center justify-center gap-2"
                      >
                        Request a Demo
                        <ArrowRight size={18} />
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href="#"
                        className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 font-semibold flex items-center justify-center gap-2 text-slate-200"
                      >
                        Contact Sales
                        <span className="w-2 h-2 rounded-full bg-cyan-300" />
                      </motion.a>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-sm font-semibold">What you’ll get</p>
                      <div className="mt-4 grid gap-3">
                        {[
                          'Industry workflow mapping',
                          'Edge deployment architecture',
                          'Alert triage & verification design',
                          'Security reporting overview',
                        ].map((x) => (
                          <div key={x} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 text-emerald-300" size={16} />
                            <p className="text-sm text-slate-300/95 leading-relaxed">{x}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-2xl bg-[#0b1220]/60 border border-white/10 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-slate-400">Response target</p>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Lock size={18} className="text-blue-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 pt-6">
                  <p className="text-xs text-slate-400">No spam. We only use your details to schedule the demo.</p>
                  <div className="flex items-center gap-3">
                    {[
                      { label: 'Edge-first', icon: <Cpu size={14} className="text-cyan-200" /> },
                      { label: 'Verified alerts', icon: <Fingerprint size={14} className="text-blue-200" /> },
                      { label: 'Audit trails', icon: <Lock size={14} className="text-emerald-200" /> },
                    ].map((x) => (
                      <div
                        key={x.label}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10"
                      >
                        {x.icon}
                        <span className="text-xs text-slate-300/95">{x.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      <footer className="py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} Sentinel Edge AI. All rights reserved.
      </footer>
    </PageContainer>
  )
}

