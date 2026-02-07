import { useNotificationStream } from '@/hooks/useNotificationStream'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function NotificationBell() {
  const { notifications, connected } = useNotificationStream()
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
      {!connected && (
        <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
      )}
    </div>
  )
}
