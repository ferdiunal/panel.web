import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import axios from 'axios'

interface Notification {
  id: string
  message: string
  type: string
  created_at: string
  read: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  const fetchNotifications = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const response = await axios.get('/api/notifications')
      setNotifications(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    // Initial fetch
    fetchNotifications()

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, loading, refetch: fetchNotifications }
}
