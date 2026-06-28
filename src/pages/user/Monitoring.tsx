import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '@/services/api'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { CameraCard, PersistedCamera } from '@/components/camera/CameraCard'

export const UserMonitoring: React.FC = () => {
  const [cameras, setCameras] = useState<PersistedCamera[]>([])
  const [loading, setLoading] = useState(true)

  const loadCameras = async () => {
    const res = await apiClient.get('/cameras')
    const list = Array.isArray(res.data) ? (res.data as any[]) : []

    // Defensive normalization: malformed camera items should never crash the page.
    const normalized = list
      .filter((c) => c && (c.id !== undefined || c.ip))
      .map((c) => {
        const ip = String(c.ip || '')
        const id = c.id !== undefined ? String(c.id) : ip
        return {
          id,
          name: String(c.name || 'Camera'),
          ip,
          streamUrl: c.streamUrl || (ip ? `http://${ip}/stream` : ''),
          snapshotUrl: c.snapshotUrl || (ip ? `http://${ip}/shot.jpg` : undefined),
          status: (c.status === 'online' ? 'online' : 'offline') as any,
        }
      })

    setCameras(normalized)
  }


  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        await loadCameras()
      } catch {
        if (!mounted) return
        toast.error('Failed to load cameras')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    // Auto-update when admin adds/removes cameras.
    const intervalId = window.setInterval(() => {
      // Keep UI responsive; don't block/flip `loading` back to true.
      loadCameras().catch(() => {})
    }, 4000)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [])


  const showEmpty = !loading && cameras.length === 0

  const grid = useMemo(

    () =>
      cameras.map((cam) => (
        <CameraCard
          key={cam.id}
          camera={cam}
          onEditIp={async () => {
            // user panel is read-only
          }}
          onRemove={async () => {
            // user panel is read-only
          }}
        />
      )),
    [cameras]
  )

  return (
    <GlobalLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">Live Cameras</h1>
        <p className="text-xs text-gray-400">Auto-retry + video→snapshot fallback</p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-white/5 bg-[#161b27] p-4 text-gray-400 text-sm">Loading cameras…</div>
      ) : showEmpty ? (
        <>
          <div className="rounded-lg border border-white/5 bg-[#161b27] p-4">
            <p className="text-sm font-semibold text-white">No Cameras Added</p>
            <p className="text-[12px] text-gray-500 mt-1">Waiting for an administrator to add cameras.</p>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{grid}</div>
      )}


      <p className="mt-6 pb-2 text-center text-xs text-gray-600">© 2026 Sentinel-Edge AI. All rights reserved.</p>
    </GlobalLayout>
  )
}

