import React, { useState } from 'react'
import { Camera, Plus } from 'lucide-react'


export type CameraOnboardingCardProps = {
  onConnect: (payload: { name: string; ip: string }) => Promise<void>
}

export const CameraOnboardingCard: React.FC<CameraOnboardingCardProps> = ({ onConnect }) => {
  const [name, setName] = useState('')
  const [ip, setIp] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = async () => {
    setError(null)

    // Basic frontend IP-ish validation: backend will be authoritative.
    // Accept: 192.168.1.100:81 (no protocol).
    const ipTrimmed = ip.trim()
    const nameTrimmed = name.trim()

    const ipLike = /^([0-9]{1,3}\.){3}[0-9]{1,3}:(\d{1,5})$/.test(ipTrimmed)
    if (!ipLike) {
      setError('Invalid IP address format. Example: 192.168.1.100:81')
      return
    }
    if (!nameTrimmed) {
      setError('Camera name is required')
      return
    }

    setConnecting(true)
    try {
      await onConnect({ name: nameTrimmed, ip: ipTrimmed })
      setIp('')
      setName('')
    } catch (e: any) {
      setError(e?.message || 'Unable to connect to camera. Check IP address and network.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/5 bg-[#161b27] p-5">
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-3 border border-blue-500/20">
            <Camera className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">No Camera Connected</h2>
            <p className="text-sm text-gray-400">Enter your camera IP address to connect</p>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-[11px] text-gray-400 mb-1">Camera Name</label>
            <div className="relative">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Main Gate Camera"
                className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/60"
                disabled={connecting}
              />
            </div>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-[11px] text-gray-400 mb-1">Camera IP Address</label>
            <input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Enter Camera IP Address"
              className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/60"
              disabled={connecting}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={connect}
          disabled={connecting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-60 disabled:hover:bg-blue-500"
        >
          {connecting ? (
            'Connecting...'
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Connect Camera
            </>
          )}
        </button>
      </div>
    </div>
  )
}

