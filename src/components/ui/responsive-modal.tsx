import * as React from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

interface ResponsiveModalProps {
    children?: React.ReactNode
    trigger?: React.ReactNode
    title?: string
    description?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    variant?: "dialog" | "sheet" | "drawer"
    side?: "top" | "bottom" | "left" | "right" // For sheet
    className?: string // For custom modal styling
    defaultFullscreen?: boolean // Uncontrolled fullscreen mode
    fullscreen?: boolean // Controlled fullscreen mode
    onFullscreenChange?: (fullscreen: boolean) => void // Fullscreen change callback
    showFullscreenButton?: boolean // Show fullscreen toggle button (default: true)
}

export const ResponsiveModal = React.forwardRef<HTMLDivElement, ResponsiveModalProps>(({
    children,
    trigger,
    title,
    description,
    open,
    onOpenChange,
    variant = "dialog",
    side = "right",
    className,
    defaultFullscreen = false,
    fullscreen,
    onFullscreenChange,
    showFullscreenButton = true,
}, ref) => {
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const [headerElement, setHeaderElement] = React.useState<HTMLDivElement | null>(null)
    const [headerHeight, setHeaderHeight] = React.useState(0)

    // Fullscreen state management (controlled vs uncontrolled)
    const [internalFullscreen, setInternalFullscreen] = React.useState(defaultFullscreen)
    const isFullscreen = fullscreen !== undefined ? fullscreen : internalFullscreen

    React.useEffect(() => {
        if (!headerElement) {
            setHeaderHeight(0)
            return
        }

        const measure = () => {
            setHeaderHeight(Math.ceil(headerElement.getBoundingClientRect().height))
        }

        measure()

        window.addEventListener("resize", measure)

        if (typeof ResizeObserver === "undefined") {
            return () => {
                window.removeEventListener("resize", measure)
            }
        }

        const observer = new ResizeObserver(() => measure())
        observer.observe(headerElement)

        return () => {
            observer.disconnect()
            window.removeEventListener("resize", measure)
        }
    }, [headerElement, open, title, description, isDesktop, variant])

    const contentMaxHeightStyle = React.useMemo(() => {
        if (headerHeight <= 0) return undefined
        return { maxHeight: `calc(100dvh - ${headerHeight}px)` }
    }, [headerHeight])

    const toggleFullscreen = () => {
        const newValue = !isFullscreen
        if (fullscreen === undefined) {
            setInternalFullscreen(newValue)
        }
        onFullscreenChange?.(newValue)
    }

    // Fullscreen toggle button component
    const FullscreenButton = () => (
        <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleFullscreen}
            className={cn(
                variant === "sheet" ? "absolute top-4 right-12" : "absolute -top-[0.5rem] right-8"
            )}
            type="button"
        >
            {isFullscreen ? (
                <Minimize2 className="size-4" />
            ) : (
                <Maximize2 className="size-4" />
            )}
            <span className="sr-only">
                {isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            </span>
        </Button>
    )

    if (isDesktop) {
        if (variant === "sheet") {
            return (
                <Sheet open={open} onOpenChange={onOpenChange}>
                    {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
                    <SheetContent
                        side={side}
                        className={cn(
                            "transition-all duration-200 ease-in-out",
                            isFullscreen
                                ? "data-[side=left]:sm:max-w-none data-[side=right]:sm:max-w-none data-[side=left]:w-screen data-[side=right]:w-screen data-[side=left]:sm:h-full data-[side=right]:sm:h-full"
                                : "data-[side=right]:w-3/4 data-[side=right]:sm:max-w-sm data-[side=left]:w-3/4 data-[side=left]:sm:max-w-sm",
                            className
                        )}
                    >
                        <SheetHeader className="relative" ref={setHeaderElement}>
                            {showFullscreenButton && <FullscreenButton />}
                            {title && <SheetTitle>{title}</SheetTitle>}
                            {description && <SheetDescription>{description}</SheetDescription>}
                        </SheetHeader>
                        <div
                            className={cn("px-4 min-h-0 overflow-y-auto", isFullscreen && "flex-1")}
                            style={contentMaxHeightStyle}
                            ref={ref}
                        >
                            {children}
                        </div>
                    </SheetContent>
                </Sheet>
            )
        }

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent
                    className={cn(
                        "transition-all duration-200 ease-in-out flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden",
                        isFullscreen
                            ? "sm:w-screen sm:h-screen sm:max-w-none sm:max-h-[100dvh] rounded-none"
                            : "max-w-[calc(100%-2rem)] sm:max-w-md",
                        className
                    )}
                >
                    <DialogHeader className="relative" ref={setHeaderElement}>
                        {showFullscreenButton && <FullscreenButton />}
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    <div
                        className={cn("min-h-0 overflow-y-auto", isFullscreen && "flex-1")}
                        style={contentMaxHeightStyle}
                        ref={ref}
                    >
                        {children}
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
            <DrawerContent>
                <DrawerHeader className="text-left" ref={setHeaderElement}>
                    {title && <DrawerTitle>{title}</DrawerTitle>}
                    {description && <DrawerDescription>{description}</DrawerDescription>}
                </DrawerHeader>
                <div className="px-4 min-h-0 overflow-y-auto" style={contentMaxHeightStyle} ref={ref}>
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    )
})
ResponsiveModal.displayName = "ResponsiveModal"
