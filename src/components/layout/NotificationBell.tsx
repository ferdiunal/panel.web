import { useNotifications } from '@/hooks/useNotifications'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function NotificationBell() {
  const { unreadCount } = useNotifications()

  return (
    <div className="relative cursor-pointer">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </div>
  )
}
