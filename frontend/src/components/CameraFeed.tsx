import React, { useState, useRef, useEffect, useCallback } from 'react'
import { RotateCcw, Camera, Maximize2, X } from 'lucide-react'

const DEFAULT_CAMERA_HOST = import.meta.env.VITE_CAMERA_HOST || 'http://10.184.143.111:8080'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const normalizeCameraHost = (value: string) => {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `http://${value}`
  return trimTrailingSlash(withProtocol)
}

const CAM_BASE = normalizeCameraHost(DEFAULT_CAMERA_HOST)

interface CameraFeedProps {
  name?: string
  className?: string
  showControls?: boolean
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ name = 'Live Feed', className = '', showControls = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fullCanvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const animRef = useRef<number>(0)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const activeRef = useRef(false) // tracks if feed is active
  const [status, setStatus] = useState<'loading' | 'live' | 'error'>('loading')
  const [fullscreen, setFullscreen] = useState(false)

  const stopFeed = useCallback(() => {
    activeRef.current = false
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    cancelAnimationFrame(animRef.current)
    if (imgRef.current) { imgRef.current.onload = null; imgRef.current.onerror = null; imgRef.current.src = ''; imgRef.current = null }
  }, [])

  const startFeed = useCallback(() => {
    stopFeed()
    activeRef.current = true

    const img = new Image()
    img.crossOrigin = 'anonymous'
    imgRef.current = img

    const draw = () => {
      if (!activeRef.current || !img.complete || img.naturalWidth === 0) return
      const c1 = canvasRef.current
      const c2 = fullCanvasRef.current
      if (c1) { const ctx = c1.getContext('2d'); ctx?.drawImage(img, 0, 0, c1.width, c1.height) }
      if (c2 && fullscreen) { const ctx = c2.getContext('2d'); ctx?.drawImage(img, 0, 0, c2.width, c2.height) }
    }

    const loop = () => {
      if (!activeRef.current) return
      draw()
      animRef.current = requestAnimationFrame(loop)
    }

    img.onload = () => {
      if (!activeRef.current) return
      setStatus('live')
      loop()
    }

    img.onerror = () => {
      if (!activeRef.current) return
      setStatus('error')
    }

    intervalRef.current = setInterval(() => {
      if (!activeRef.current) return
      img.src = `${CAM_BASE}/shot.jpg?t=${Date.now()}`
    }, 150)

    // load first frame immediately
    img.src = `${CAM_BASE}/shot.jpg?t=${Date.now()}`
  }, [stopFeed, fullscreen])

  // start on mount, stop on unmount
  useEffect(() => {
    startFeed()
    return () => stopFeed()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ESC to close fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    // clear canvas first to avoid showing stale frame
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setStatus('loading')
    startFeed()
  }

  const handleSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `snapshot-${Date.now()}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.95)
    link.click()
  }

  const handleZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFullscreen(true)
  }

  return (
    <>
      {/* Inline feed */}
      <div className={`relative bg-black ${className}`}>
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117] z-10">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117] z-10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" className="mb-1">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              <line x1="2" y1="2" x2="22" y2="22"/>
            </svg>
            <p className="text-[10px] text-gray-500">Camera Offline</p>
            <button onClick={handleReset} className="mt-1.5 text-[10px] text-blue-400 hover:text-blue-300">Retry</button>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={640} height={360}
          className="w-full h-full object-cover"
          style={{ opacity: status === 'live' ? 1 : 0, transition: 'opacity 0.3s' }}
        />
        {showControls && (
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-2 z-20">
            <button onClick={handleReset} title="Reset feed"
              className="p-1 bg-black/60 rounded hover:bg-blue-600/80 transition-colors">
              <RotateCcw size={10} className="text-white" />
            </button>
            <button onClick={handleSnapshot} title="Take snapshot"
              className="p-1 bg-black/60 rounded hover:bg-blue-600/80 transition-colors">
              <Camera size={10} className="text-white" />
            </button>
            <button onClick={handleZoom} title="Fullscreen"
              className="p-1 bg-black/60 rounded hover:bg-blue-600/80 transition-colors">
              <Maximize2 size={10} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-[999] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setFullscreen(false)}>
          <div className="relative w-full max-w-5xl px-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-white font-medium">{name}</span>
                <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded font-bold">LIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleReset} title="Reset"
                  className="p-1.5 bg-white/10 rounded hover:bg-blue-600/80 transition-colors">
                  <RotateCcw size={14} className="text-white" />
                </button>
                <button onClick={handleSnapshot} title="Snapshot"
                  className="p-1.5 bg-white/10 rounded hover:bg-blue-600/80 transition-colors">
                  <Camera size={14} className="text-white" />
                </button>
                <button onClick={() => setFullscreen(false)} title="Close"
                  className="p-1.5 bg-white/10 rounded hover:bg-red-600/80 transition-colors">
                  <X size={14} className="text-white" />
                </button>
              </div>
            </div>
            <canvas
              ref={fullCanvasRef}
              width={1280} height={720}
              className="w-full rounded-lg border border-white/10"
              style={{ opacity: status === 'live' ? 1 : 0, transition: 'opacity 0.3s' }}
            />
            {status !== 'live' && (
              <div className="w-full aspect-video rounded-lg border border-white/10 bg-[#0d1117] flex items-center justify-center absolute top-10 left-4 right-4">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <p className="text-center text-[10px] text-gray-600 mt-2">Press ESC or click outside to close</p>
          </div>
        </div>
      )}
    </>
  )
}
