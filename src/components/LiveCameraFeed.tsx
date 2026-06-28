import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Maximize2, RotateCcw, VideoOff, X } from 'lucide-react'

const DEFAULT_CAMERA_HOST = import.meta.env.VITE_CAMERA_HOST || 'http://10.184.143.111:8080'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const normalizeCameraHost = (value: string) => {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `http://${value}`
  return trimTrailingSlash(withProtocol)
}

const withCacheBust = (url: string) => {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}t=${Date.now()}`
}

type FeedStatus = 'loading' | 'live' | 'error'

type LiveMode = 'video' | 'snapshot'

interface LiveCameraFeedProps {
  name?: string
  className?: string
  showControls?: boolean
  streamUrl?: string
  snapshotUrl?: string
}

const DEFAULT_MIN_BACKOFF_MS = 250
const DEFAULT_MAX_BACKOFF_MS = 5000

export const LiveCameraFeed: React.FC<LiveCameraFeedProps> = ({
  name = 'Live Feed',
  className = '',
  showControls = false,
  streamUrl,
  snapshotUrl,
}) => {
  const [status, setStatus] = useState<FeedStatus>('loading')
  const [fullscreen, setFullscreen] = useState(false)
  const [mode, setMode] = useState<LiveMode>('video')
  const [source, setSource] = useState('')

  const [attemptMs, setAttemptMs] = useState(DEFAULT_MIN_BACKOFF_MS)
  const [lastErrorAt, setLastErrorAt] = useState<number | null>(null)

  const cameraHost = useMemo(() => normalizeCameraHost(DEFAULT_CAMERA_HOST), [])
  const liveStreamUrl = streamUrl || import.meta.env.VITE_CAMERA_STREAM_URL || `${cameraHost}/video`
  const stillFrameUrl = snapshotUrl || import.meta.env.VITE_CAMERA_SNAPSHOT_URL || `${cameraHost}/shot.jpg`

  const retryTimerRef = useRef<number | null>(null)
  const intervalSnapshotRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }

  const clearSnapshotInterval = () => {
    if (intervalSnapshotRef.current) {
      window.clearInterval(intervalSnapshotRef.current)
      intervalSnapshotRef.current = null
    }
  }

  const computeNextBackoff = (prev: number) => Math.min(DEFAULT_MAX_BACKOFF_MS, Math.floor(prev * 1.7))

  const applyVideoSource = useCallback(() => {
    setMode('video')
    setStatus('loading')
    setSource(withCacheBust(liveStreamUrl))
  }, [liveStreamUrl])

  const applySnapshotSource = useCallback(() => {
    setMode('snapshot')
    setStatus('loading')
    setSource(withCacheBust(stillFrameUrl))
  }, [stillFrameUrl])

  const scheduleRetry = useCallback(() => {
    clearRetryTimer()

    const delay = attemptMs
    retryTimerRef.current = window.setTimeout(() => {

      if (isPausedRef.current) return
      setLastErrorAt(null)

      // Always try video first. If it fails again, we'll enter snapshot mode.
      setAttemptMs((prev) => computeNextBackoff(prev))
      applyVideoSource()
    }, delay)
  }, [attemptMs, applyVideoSource])

  const startFeed = useCallback(() => {
    clearRetryTimer()
    clearSnapshotInterval()
    setAttemptMs(DEFAULT_MIN_BACKOFF_MS)
    setLastErrorAt(null)

    // video first
    applyVideoSource()
  }, [applyVideoSource])

  useEffect(() => {
    startFeed()

    return () => {
      clearRetryTimer()
      clearSnapshotInterval()
    }
  }, [startFeed])

  // Pause background work when tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      isPausedRef.current = document.visibilityState !== 'visible'
    }

    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Snapshot polling only runs in snapshot mode.
  useEffect(() => {
    clearSnapshotInterval()

    if (mode !== 'snapshot') return

    // Keep it relatively cheap for grid views.
    intervalSnapshotRef.current = window.setInterval(() => {
      if (isPausedRef.current) return
      setSource(withCacheBust(stillFrameUrl))
    }, 220)

    return () => clearSnapshotInterval()
  }, [mode, stillFrameUrl])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleLoad = () => {
    // On a successful load, mark live.
    setStatus('live')
  }

  const handleError = () => {
    // If video fails, fallback to snapshot polling.
    if (mode === 'video') {
      setLastErrorAt(Date.now())
      setStatus('loading')
      setMode('snapshot')
      applySnapshotSource()
      return
    }

    // Snapshot also failed.
    setLastErrorAt(Date.now())
    setStatus('error')
    scheduleRetry()
  }

  const isLive = status === 'live'

  const connectionLabel = useMemo(() => {
    if (status === 'error') return 'OFFLINE'
    if (status === 'live') return 'LIVE'

    // loading
    return mode === 'snapshot' ? 'SNAPSHOTTING' : 'CONNECTING'
  }, [mode, status])

  const connectionDotClass = useMemo(() => {
    if (status === 'live') return 'animate-pulse bg-red-500'
    if (status === 'error') return 'bg-gray-500'
    return 'bg-gray-500'
  }, [status])

  const cameraFrame = (fit: 'cover' | 'contain') => (
    <>
      {source && (
        <img
          src={source}
          alt={name}
          onLoad={handleLoad}
          onError={handleError}
          draggable={false}
          referrerPolicy="no-referrer"
          className={`h-full w-full ${fit === 'cover' ? 'object-cover' : 'object-contain'}`}
          style={{ opacity: isLive ? 1 : 0, transition: 'opacity 0.3s' }}
        />
      )}
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0d1117]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d1117]">
          <VideoOff size={28} className="mb-1 text-gray-600" />
          <p className="text-[10px] text-gray-500">Camera Offline</p>
          <button onClick={startFeed} className="mt-1.5 text-[10px] text-blue-400 hover:text-blue-300">
            Retry
          </button>
        </div>
      )}
    </>
  )

  const handleReset = (event: React.MouseEvent) => {
    event.stopPropagation()
    startFeed()
  }

  const handleSnapshot = (event: React.MouseEvent) => {
    event.stopPropagation()
    const link = document.createElement('a')
    link.download = `snapshot-${Date.now()}.jpg`
    link.href = withCacheBust(stillFrameUrl)
    link.target = '_blank'
    link.rel = 'noreferrer'
    link.click()
  }

  const handleZoom = (event: React.MouseEvent) => {
    event.stopPropagation()
    setFullscreen(true)
  }

  const loadHint = useMemo(() => {
    if (status === 'error') return lastErrorAt ? `Last fail: ${new Date(lastErrorAt).toLocaleTimeString()}` : ''
    if (status !== 'loading') return ''
    return mode === 'video'
      ? `Trying video… (retry in ~${attemptMs}ms)`
      : 'Fallback snapshot polling…'
  }, [attemptMs, lastErrorAt, mode, status])

  return (
    <>
      <div className={`relative overflow-hidden bg-black ${className}`}>
        {cameraFrame('cover')}

        <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-[10px] font-bold text-white">
          <span className={`h-2 w-2 rounded-full ${connectionDotClass}`} />
          {connectionLabel}
        </div>

        <div className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-[10px] text-gray-200">
          {mode === 'snapshot' ? 'Snapshot mode' : 'Video mode'}
        </div>

        {loadHint && status !== 'live' && (
          <div className="pointer-events-none absolute bottom-8 left-2 right-2 rounded bg-black/40 px-2 py-1 text-[10px] text-gray-300">
            {loadHint}
          </div>
        )}

        {showControls && (
          <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-2">
            <button
              onClick={handleReset}
              title="Reset feed"
              className="rounded bg-black/60 p-1.5 transition-colors hover:bg-blue-600/80"
            >
              <RotateCcw size={12} className="text-white" />
            </button>
            <button
              onClick={handleSnapshot}
              title="Take snapshot"
              className="rounded bg-black/60 p-1.5 transition-colors hover:bg-blue-600/80"
            >
              <Camera size={12} className="text-white" />
            </button>
            <button
              onClick={handleZoom}
              title="Fullscreen"
              className="rounded bg-black/60 p-1.5 transition-colors hover:bg-blue-600/80"
            >
              <Maximize2 size={12} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/95"
          onClick={() => setFullscreen(false)}
        >
          <div className="relative w-full max-w-5xl px-4" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${connectionDotClass}`} />
                <span className="text-sm font-medium text-white">{name}</span>
                <span className="rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {connectionLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  title="Reset"
                  className="rounded bg-white/10 p-1.5 transition-colors hover:bg-blue-600/80"
                >
                  <RotateCcw size={14} className="text-white" />
                </button>
                <button
                  onClick={handleSnapshot}
                  title="Snapshot"
                  className="rounded bg-white/10 p-1.5 transition-colors hover:bg-blue-600/80"
                >
                  <Camera size={14} className="text-white" />
                </button>
                <button
                  onClick={() => setFullscreen(false)}
                  title="Close"
                  className="rounded bg-white/10 p-1.5 transition-colors hover:bg-red-600/80"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
              {cameraFrame('contain')}
            </div>
            {status !== 'live' && loadHint && (
              <p className="mt-2 text-center text-[10px] text-gray-400">{loadHint}</p>
            )}
            <p className="mt-2 text-center text-[10px] text-gray-600">Press ESC or click outside to close</p>
          </div>
        </div>
      )}
    </>
  )
}

