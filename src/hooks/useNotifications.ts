/**
 * Notifications Hook
 *
 * Kullanıcı bildirimlerini çekmek ve yönetmek için hook.
 * Oturum açık olduğunda bildirimleri çeker ve 30 saniyede bir günceller.
 *
 * ## Kullanım
 *
 * ```tsx
 * const { notifications, unreadCount, loading, refetch } = useNotifications();
 *
 * // Okunmamış bildirim sayısı
 * <Badge>{unreadCount}</Badge>
 *
 * // Bildirimleri listele
 * {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
 *
 * // Manuel yenile
 * <Button onClick={refetch}>Yenile</Button>
 * ```
 */
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import api from '@/lib/axios'

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
  const { isAuthenticated } = useAuthStore()

  const fetchNotifications = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const response = await api.get('/notifications')
      setNotifications(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    // İlk yükleme
    fetchNotifications()

    // 30 saniyede bir güncelle
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, loading, refetch: fetchNotifications }
}
