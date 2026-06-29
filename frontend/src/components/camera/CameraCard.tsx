import React, { useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { LiveCameraFeed } from '@/components/LiveCameraFeed'


export type CameraStatus = 'online' | 'offline'

export type PersistedCamera = {
  id: string
  name: string
  ip: string
  streamUrl: string
  snapshotUrl?: string
  status: CameraStatus
}

export type CameraCardProps = {
  camera: PersistedCamera
  onEditIp: (payload: { id: string; name: string; ip: string }) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

const ipLike = /^([0-9]{1,3}\.){3}[0-9]{1,3}:(\d{1,5})$/

export const CameraCard: React.FC<CameraCardProps> = ({ camera, onEditIp, onRemove }) => {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(camera.name)
  const [ip, setIp] = useState(camera.ip)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(camera.name)
    setIp(camera.ip)
  }, [camera.id, camera.name, camera.ip])

  const statusBadge = useMemo(() => {
    const online = camera.status === 'online'
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
          online ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-300'
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
        {online ? 'Online' : 'Offline'}
      </span>
    )
  }, [camera.status])

  const save = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Camera name is required')
      return
    }
    const ipTrimmed = ip.trim()
    if (!ipLike.test(ipTrimmed)) {
      setError('Invalid IP address format. Example: 192.168.1.100:81')
      return
    }

    setBusy(true)
    try {
      await onEditIp({ id: camera.id, name: name.trim(), ip: ipTrimmed })
      setEditing(false)
    } catch (e: any) {
      setError(e?.message || 'Unable to connect to camera. Check IP address and network.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setError(null)
    setBusy(true)
    try {
      await onRemove(camera.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-[#161b27]">
      <div className="aspect-video bg-black">
        <LiveCameraFeed
          name={camera.name}
          showControls
          streamUrl={camera.streamUrl}
          snapshotUrl={camera.snapshotUrl}
          className="h-full w-full"
        />
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{camera.name}</p>
              <p className="text-sm text-gray-400 break-all">{camera.ip}</p>
            </div>
            {statusBadge}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {!editing ? (
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-blue-400 hover:border-blue-500/40 hover:text-blue-300 disabled:opacity-60"
                  onClick={() => setEditing(true)}
                  disabled={busy}
                >
                  <Pencil className="h-4 w-4" />
                  Edit IP
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0d1117] border border-red-500/20 px-3 py-2 text-sm text-red-300 hover:border-red-500/40 disabled:opacity-60"
                  onClick={remove}
                  disabled={busy}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Camera
                </button>
              </div>
            ) : (
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Camera Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/60"
                      disabled={busy}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Camera IP</label>
                    <input
                      value={ip}
                      onChange={(e) => setIp(e.target.value)}
                      className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/60"
                      disabled={busy}
                      placeholder="192.168.1.100:81"
                    />
                  </div>
                </div>

                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={save}
                    disabled={busy}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
                  >
                    {busy ? 'Connecting...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    disabled={busy}
                    className="inline-flex items-center justify-center rounded-lg bg-[#0d1117] border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-white/20 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

