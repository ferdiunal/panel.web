import * as React from "react"
import {
    BookOpen,
    Bot,
    Command,
    Settings2,
    SquareTerminal,
    LogOut,
    User as UserIcon,
    LayoutDashboard,
    Users,
    Settings,
    Shield,
    FileText,
    Database,
    Globe,
    Server,
    CreditCard,
    Bell,
    Lock
} from "lucide-react"

import { useEffect, useState } from "react"
import { navigationService, type NavItem } from "@/services/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/auth"
import { useAppStore } from "@/stores/app"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "@/hooks/useTranslation"

// Icon mapping
const iconMap: Record<string, any> = {
    "dashboard": LayoutDashboard,
    "users": Users,
    "settings": Settings,
    "shield": Shield,
    "file-text": FileText,
    "database": Database,
    "globe": Globe,
    "server": Server,
    "credit-card": CreditCard,
    "bell": Bell,
    "lock": Lock,
    "bot": Bot,
    "book-open": BookOpen,
    "square-terminal": SquareTerminal,
}

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, logout } = useAuthStore()
    const { settings } = useAppStore()
    const { t } = useTranslation()
    const [navItems, setNavItems] = useState<NavItem[]>([])
    const location = useLocation()

    const siteName = settings?.site_name || "Panel.go"
    const siteLogo = settings?.logo || null

    useEffect(() => {
        const fetchNav = async () => {
            try {
                const items = await navigationService.fetchNavigation()
                setNavItems(items || [])
            } catch (error) {
                console.error("Failed to fetch navigation:", error)
            }
        }
        fetchNav()
    }, [])

    // Group items — account ve settings'i sidebar içeriğinden ayır
    const accountNav = navItems.find(item => item.slug === 'account')
    const settingsNav = navItems.find(item => item.slug === 'settings')

    const groupedItems = navItems
        .filter(item => item.slug !== 'account' && item.slug !== 'settings')
        .reduce((acc, item) => {
            const group = item.group || "Genel";
            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {} as Record<string, NavItem[]>);

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="px-0">
                            <Link to="/dashboard">
                                {siteLogo ? (
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                                        <img src={siteLogo} alt={siteName} className="size-8 object-contain" />
                                    </div>
                                ) : (
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Command className="size-4" />
                                    </div>
                                )}
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{siteName}</span>
                                    <span className="truncate text-xs">by Panel.go</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {Object.entries(groupedItems).map(([group, items]) => (
                    <SidebarGroup key={group}>
                        <SidebarGroupLabel>{group}</SidebarGroupLabel>
                        <SidebarMenu>
                            {items.map((item) => {
                                const Icon = iconMap[item.icon] || SquareTerminal
                                return (
                                    <SidebarMenuItem key={item.slug}>
                                        <SidebarMenuButton asChild tooltip={item.title} isActive={
                                            item.type === 'resource'
                                                ? location.pathname === `/resource/${item.slug}`
                                                : location.pathname === `/${item.slug}`
                                        }>
                                            <Link
                                                to={item.type === 'resource' ? `/resource/${item.slug}` : `/${item.slug}`}
                                                title={item.title}
                                            >
                                                <Icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
                                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.name || "User"}</span>
                                        <span className="truncate text-xs">{user?.email || "user@example.com"}</span>
                                    </div>
                                    <Settings2 className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
                                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.name}</span>
                                            <span className="truncate text-xs">{user?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {accountNav && (() => {
                                    const AccountIcon = iconMap[accountNav.icon] || UserIcon
                                    return (
                                        <DropdownMenuItem asChild>
                                            <Link to={`/${accountNav.slug}`}>
                                                <AccountIcon className="mr-2 h-4 w-4" />
                                                {accountNav.title}
                                            </Link>
                                        </DropdownMenuItem>
                                    )
                                })()}
                                {settingsNav && (() => {
                                    const SettingsIcon = iconMap[settingsNav.icon] || Settings2
                                    return (
                                        <DropdownMenuItem asChild>
                                            <Link to={`/${settingsNav.slug}`}>
                                                <SettingsIcon className="mr-2 h-4 w-4" />
                                                {settingsNav.title}
                                            </Link>
                                        </DropdownMenuItem>
                                    )
                                })()}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => logout()}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    {t('navigation.logout')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
