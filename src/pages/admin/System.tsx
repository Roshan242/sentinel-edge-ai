import React from 'react'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { Server, Wifi, HardDrive, Zap } from 'lucide-react'

export const AdminSystem: React.FC = () => {
  return (
    <GlobalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="text-gray-400">Monitor system health and device status</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Server,
              label: 'Server Status',
              value: 'Online',
              status: 'healthy',
            },
            {
              icon: Wifi,
              label: 'Network',
              value: '99.8% Uptime',
              status: 'healthy',
            },
            {
              icon: HardDrive,
              label: 'Storage',
              value: '65% Used',
              status: 'warning',
            },
            {
              icon: Zap,
              label: 'System Load',
              value: '45%',
              status: 'healthy',
            },
          ].map((item, index) => {
            const Icon = item.icon
            const statusColor =
              item.status === 'healthy'
                ? 'text-green-400'
                : item.status === 'warning'
                ? 'text-yellow-400'
                : 'text-red-400'

            return (
              <div
                key={index}
                className="bg-dark-900 border border-dark-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{item.label}</p>
                    <p className="text-2xl font-bold mt-2">{item.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${statusColor}`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Device List */}
        <div className="bg-dark-900 border border-dark-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Connected Devices</h2>
          <div className="space-y-3">
            {[
              { name: 'Camera 1', status: 'online', lastSeen: 'Now' },
              { name: 'Camera 2', status: 'online', lastSeen: 'Now' },
              { name: 'Biometric Scanner', status: 'online', lastSeen: 'Now' },
              { name: 'Access Control', status: 'offline', lastSeen: '2 hours ago' },
            ].map((device, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-sm text-gray-400">Last seen: {device.lastSeen}</p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    device.status === 'online'
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-red-500'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlobalLayout>
  )
}
