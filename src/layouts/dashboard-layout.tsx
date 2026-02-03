import { Outlet, useLocation, Link } from "react-router-dom"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Separator } from "@/components/ui/separator"

export default function DashboardLayout() {
    const location = useLocation()
    return (
        <SidebarProvider>
            <DashboardSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink asChild>
                                        <Link to="/">Dashboard</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {location.pathname.split("/").filter(Boolean).map((segment, index, array) => {
                                    const path = `/${array.slice(0, index + 1).join("/")}`
                                    const isLast = index === array.length - 1

                                    if (segment === "resource") return null

                                    // Custom mapping for segments
                                    let label = segment.charAt(0).toUpperCase() + segment.slice(1)

                                    return (
                                        <div key={path} className="flex items-center">
                                            <BreadcrumbSeparator className="hidden md:block" />
                                            <BreadcrumbItem className="hidden md:block">
                                                {isLast ? (
                                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink asChild>
                                                        {/* If segment is 'resource', maybe disable link or link to valid path? 
                                                            For now, keeping it clickable or just text if it acts as a folder 
                                                        */}
                                                        <Link to={path}>{label}</Link>
                                                    </BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                        </div>
                                    )
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
