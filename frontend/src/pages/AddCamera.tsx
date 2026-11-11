import { useState } from 'react'
import apiClient from '@/services/api'
import { LiveCameraFeed } from '@/components/LiveCameraFeed'

type AddCameraResponse = {
  success: boolean
  id?: string
}

export default function AddCamera() {
  const [cameraId, setCameraId] = useState('')
  const [streamUrl, setStreamUrl] = useState('')
  const [addedId, setAddedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamSrc = addedId ? `/api/camera/stream/${encodeURIComponent(addedId)}` : null

  const onSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await apiClient.post('/camera/add', { id: cameraId.trim(), url: streamUrl.trim() })
      const data = res.data as AddCameraResponse

      if (data?.success && data?.id) {
        setAddedId(data.id)
      } else {
        // fallback: show whatever ID we tried
        setAddedId(cameraId.trim())
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to add camera')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-white mb-6">Add Camera</h1>

        <div className="bg-dark-900 rounded-xl border border-white/10 p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Camera ID</label>
            <input
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white outline-none focus:border-blue-500"
              placeholder="e.g. cam1"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Stream URL (RTSP/HTTP)</label>
            <input
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white outline-none focus:border-blue-500"
              placeholder="rtsp://... or http://..."
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            onClick={onSubmit}
            disabled={loading || !cameraId.trim() || !streamUrl.trim()}
            className="w-full rounded-lg bg-primary-500 hover:bg-primary-400 disabled:bg-primary-500/40 disabled:cursor-not-allowed px-4 py-2 text-white font-semibold"
          >
            {loading ? 'Adding...' : 'Add Camera'}
          </button>
        </div>

        {streamSrc && (
          <div className="mt-6">
            <div className="text-sm font-semibold text-gray-200 mb-2">Live feed</div>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              {/* Requirement says use <img src="stream URL">; LiveCameraFeed uses <img> internally. */}
              <LiveCameraFeed
                name={`Camera ${cameraId}`}
                streamUrl={streamSrc}
                showControls={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
