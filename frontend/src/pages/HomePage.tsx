import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  UserPlus, User, X, ChevronRight
} from 'lucide-react'

import PremiumSecurityFeaturesSection from '@/components/homepage/PremiumSecurityFeaturesSection'
import SolutionsPage from '@/components/homepage/SolutionsPage'
import PricingPage from '@/components/homepage/PricingPage'



// ── Animated background canvas ───────────────────────────────────────────────
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59,130,246,${p.opacity})`
        ctx.fill()
      })

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(59,130,246,${0.12 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

// ── Scanning line effect ──────────────────────────────────────────────────────
const ScanLine: React.FC = () => (
  <motion.div
    className="fixed left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent z-0 pointer-events-none"
    animate={{ top: ['0%', '100%'] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
  />
)

// ── Sign-in modal ────────────────────────────────────────────────────────────
const RoleModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-sm bg-[#0d1117] border border-blue-500/20 rounded-2xl p-6 shadow-2xl shadow-blue-500/10"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={event => event.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-white">Sign In</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-5">Choose which sign-in page to continue to.</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                onClose()
                navigate('/login?role=user')
              }}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-gray-200 transition-colors hover:border-blue-500/60 hover:bg-blue-500/10 hover:text-white"
            >
              <User size={22} className="text-blue-400" />
              User
            </button>
            <button
              onClick={() => {
                onClose()
                navigate('/login?role=admin')
              }}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-gray-200 transition-colors hover:border-blue-500/60 hover:bg-blue-500/10 hover:text-white"
            >
              <Shield size={22} className="text-blue-400" />
              Admin
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Stats counter ─────────────────────────────────────────────────────────────
const stats = [
  { value: '99.9%', label: 'Uptime' },
  { value: '50ms', label: 'Response Time' },
  { value: '256-bit', label: 'Encryption' },
  { value: '24/7', label: 'Monitoring' },
]

// ── Home Page ─────────────────────────────────────────────────────────────────
export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.querySelector('#features')
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToSolutions = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.querySelector('#solutions')
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }


  return (
    <div className="min-h-screen bg-[#020817] text-white overflow-x-hidden">
      <ParticleBackground />
      <ScanLine />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 border-b border-white/5"
        style={{ background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">

          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30"
          >
            <Shield size={18} className="text-white" />
          </motion.div>
          <div>
            <span className="font-bold text-white tracking-wide">SENTINEL-EDGE</span>
            <span className="text-blue-400 font-bold"> AI</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          {['Features', 'Solutions', 'Security', 'Pricing'].map((item) => (
            <motion.a
              key={item}
              href={
                item === 'Features'
                  ? '#features'
                  : item === 'Solutions'
                    ? '#solutions'
                    : item === 'Pricing'
                      ? '#pricing'
                      : '#'
              }
              onClick={
                item === 'Features'
                  ? scrollToFeatures
                  : item === 'Solutions'
                    ? scrollToSolutions
                    : item === 'Pricing'
                      ? (e) => {
                          e.preventDefault()
                          const el = document.querySelector('#pricing')
                          if (!el) return
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      : undefined
              }
              whileHover={{ color: '#fff' }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {item}
            </motion.a>
          ))}

        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-2 border border-white/10 hover:border-blue-500/50 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-all"
          >
            Login
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25"
          >
            <UserPlus size={15} /> Sign Up
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 pt-36 pb-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6"
        >
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          AI-Powered Security Platform — Now Live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl mx-auto"
        >
          Intelligent Security.
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Real-Time Protection.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-lg text-gray-400 max-w-2xl mx-auto mb-10"
        >
          Advanced surveillance and biometric management with AI-driven threat detection, edge computing, and
          comprehensive security analytics.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <UserPlus size={18} /> Get Started Free
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLoginModal(true)}
            className="px-8 py-3.5 border border-white/10 hover:border-blue-500/40 rounded-xl font-semibold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Login to Dashboard <ChevronRight size={16} />
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16"
        >
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="bg-white/3 border border-white/5 rounded-xl p-4 backdrop-blur-sm"
            >
              <p className="text-2xl font-bold text-blue-400">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <PremiumSecurityFeaturesSection />

      {/* Solutions */}
      <SolutionsPage />

      {/* Pricing */}
      <PricingPage />


      {/* CTA Banner */}

      <section className="relative z-10 py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl border border-blue-500/20 p-12 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.05) 100%)' }}
        >
          {/* inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-16 -right-16 w-48 h-48 border border-blue-500/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-16 -left-16 w-64 h-64 border border-cyan-500/10 rounded-full"
          />

          <div className="relative z-10">
            <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Secure Your Environment?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join security teams worldwide trusting SENTINEL-EDGE AI for mission-critical protection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
              >
                <UserPlus size={18} /> Get Started Free
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-3.5 border border-white/10 hover:border-blue-500/40 rounded-xl font-semibold text-gray-300 hover:text-white transition-all"
              >
                Login
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield size={14} className="text-blue-600" />
          <span className="text-gray-500 font-medium">SENTINEL-EDGE AI</span>
        </div>
        © 2025 Sentinel-Edge AI. All rights reserved.
      </footer>

      {showLoginModal && <RoleModal onClose={() => setShowLoginModal(false)} />}
    </div>
  )
}
