import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import apiClient from '@/services/api'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { CameraOnboardingCard } from '@/components/camera/CameraOnboardingCard'
import { CameraCard, PersistedCamera } from '@/components/camera/CameraCard'

export const AdminMonitoring: React.FC = () => {
  const [cameras, setCameras] = useState<PersistedCamera[]>([])
  const [loading, setLoading] = useState(true)

  const loadCameras = async () => {
    const res = await apiClient.get('/cameras')
    const list = (res.data || []) as any[]

    setCameras(
      list.map((c) => ({
        id: String(c.id),
        name: String(c.name || 'Camera'),
        ip: String(c.ip || ''),
        streamUrl: c.streamUrl || (c.ip ? `http://${c.ip}/stream` : ''),
        snapshotUrl: c.snapshotUrl || (c.ip ? `http://${c.ip}/shot.jpg` : ''),
        status: (c.status || 'offline') as any,
      }))
    )
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

    // Auto-update when cameras are added/removed.
    const intervalId = window.setInterval(() => {
      loadCameras().catch(() => {})
    }, 4000)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [])


  const onConnect = async (payload: { name: string; ip: string }) => {
    const res = await apiClient.post('/cameras/connect', payload)
    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Unable to connect to camera')
    }
    toast.success('Camera connected')
    await loadCameras()
  }

  const onEditIp = async ({ id, name, ip }: { id: string; name: string; ip: string }) => {
    const res = await apiClient.put(`/cameras/${id}`, { name, ip })
    if (!res.data?.success && res.status !== 200) {
      throw new Error(res.data?.message || 'Unable to connect to camera. Check IP address and network.')
    }
    toast.success('Camera updated')
    await loadCameras()
  }

  const onRemove = async (id: string) => {
    await apiClient.delete(`/cameras/${id}`)
    toast.success('Camera removed')
    await loadCameras()
  }

  const hasCameras = !loading && cameras.length > 0

  const grid = useMemo(
    () => (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {cameras.map((cam) => (
          <CameraCard key={cam.id} camera={cam} onEditIp={onEditIp} onRemove={onRemove} />
        ))}
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cameras]
  )

  return (
    <GlobalLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Monitoring</h1>
            <p className="text-gray-400">Real-time camera surveillance feeds (auto video→snapshot fallback)</p>
            <div className="mt-2 text-[12px] text-gray-500">
              {hasCameras ? 'Feeds will auto-retry and show snapshot mode if video is unreachable.' : 'Add a new camera to start monitoring.'}
            </div>
          </div>
          <div className="rounded border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
            Cameras configured: {cameras.length}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">{hasCameras ? grid : null}</div>
          <div className="xl:col-span-1">
            <CameraOnboardingCard onConnect={onConnect} />
          </div>
        </div>
      </div>
    </GlobalLayout>
  )
}

