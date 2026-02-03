import { Command } from "lucide-react"

export function GlobalLoader() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-muted/30 outline outline-1 outline-black/10 dark:outline-white/10">
                <div className="absolute inset-0 flex items-center justify-center">
                    <Command className="h-10 w-10 animate-pulse text-foreground/80" />
                </div>
                <div className="absolute -inset-1 rounded-2xl border-t-2 border-primary/20 animate-spin" />
                <div className="absolute -inset-1 rounded-2xl border-b-2 border-primary/20 animate-[spin_1.5s_linear_infinite_reverse]" />
            </div>
            <div className="mt-8 flex flex-col items-center gap-1">
                <h3 className="text-lg font-medium tracking-tight">Panel</h3>
                <p className="text-sm text-muted-foreground animate-pulse">Yükleniyor...</p>
            </div>
        </div>
    )
}
