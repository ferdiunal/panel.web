import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Separator } from "@/components/ui/separator"
import { BreadcrumbBuilder } from "@/components/breadcrumb-builder"
import { NotificationBell } from "@/components/layout/NotificationBell"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSelector } from "@/components/layout/LanguageSelector"

export default function DashboardLayout() {
    return (
        <SidebarProvider>
            <DashboardSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <BreadcrumbBuilder />
                    </div>
                    <div className="flex items-center gap-2 px-4">
                        <LanguageSelector />
                        <ModeToggle />
                        <NotificationBell />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
