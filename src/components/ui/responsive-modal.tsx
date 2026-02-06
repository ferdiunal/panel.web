import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
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
}, ref) => {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        if (variant === "sheet") {
            return (
                <Sheet open={open} onOpenChange={onOpenChange}>
                    {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
                    <SheetContent side={side}>
                        <SheetHeader>
                            {title && <SheetTitle>{title}</SheetTitle>}
                            {description && <SheetDescription>{description}</SheetDescription>}
                        </SheetHeader>
                        <div className="px-4" ref={ref}>
                            {children}
                        </div>
                    </SheetContent>
                </Sheet>
            )
        }

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    <div ref={ref}>
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
                <DrawerHeader className="text-left">
                    {title && <DrawerTitle>{title}</DrawerTitle>}
                    {description && <DrawerDescription>{description}</DrawerDescription>}
                </DrawerHeader>
                <div className="px-4" ref={ref}>
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    )
})
ResponsiveModal.displayName = "ResponsiveModal"
