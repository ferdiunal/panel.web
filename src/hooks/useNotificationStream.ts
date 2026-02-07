import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

interface Notification {
  id: string
  message: string
  type: string
  created_at: string
  read: boolean
}

export function useNotificationStream() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connected, setConnected] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return

    // Create EventSource connection
    const eventSource = new EventSource('/api/notifications/stream', {
      withCredentials: true,
    })

    eventSource.onopen = () => {
      setConnected(true)
      console.log('SSE connection opened')
    }

    eventSource.onmessage = (event) => {
      try {
        const newNotifications = JSON.parse(event.data) as Notification[]
        setNotifications((prev) => {
          // Merge new notifications, avoid duplicates
          const existingIds = new Set(prev.map((n) => n.id))
          const filtered = newNotifications.filter((n) => !existingIds.has(n.id))
          return [...filtered, ...prev]
        })
      } catch (error) {
        console.error('Failed to parse notification:', error)
      }
    }

    eventSource.onerror = () => {
      setConnected(false)
      console.error('SSE connection error')
      eventSource.close()
    }

    // Cleanup on unmount
    return () => {
      eventSource.close()
      setConnected(false)
    }
  }, [isAuthenticated])

  return { notifications, connected }
}
