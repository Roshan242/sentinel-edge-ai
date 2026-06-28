import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const useAlerts = () => {
  useEffect(() => {
    const channel = supabase
      .channel('alerts-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          console.log('New Alert:', payload)

          toast.error(`🚨 ${payload.new.message}`, {
            duration: 5000,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}