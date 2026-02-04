import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Link, redirect } from "react-router-dom"
import { useAppStore } from "@/stores/app"
import UniversalFormField from "@/components/form-field"
import { Form } from "@/components/ui/form"
import { GalleryVerticalEnd } from "lucide-react"
import { useAuthStore } from "@/stores"

const formSchema = z.object({
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
})


export async function loader() {
    try {
        await useAuthStore.getState().checkSession()
    } catch {
        return redirect("/login")
    }
    try {
        await useAppStore.getState().init()
    } catch (error) {
        console.error('Forgot password loader error:', error);
        return null;
    }
}

export default function ForgotPasswordPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await api.post("/auth/forgot-password", values)
            toast.success("Sıfırlama bağlantısı e-posta adresinize gönderildi.")
        } catch (error: any) {
            toast.error(error.response?.data?.error || "İşlem başarısız")
        }
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    Panel Inc.
                </a>
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Şifremi Unuttum</CardTitle>
                        <CardDescription>
                            Şifrenizi sıfırlamak için e-posta adresinizi girin
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                                <UniversalFormField
                                    control={form.control}
                                    name="email"
                                    label="E-posta"
                                    placeholder="m@example.com"
                                />
                                <Button type="submit" className="w-full">
                                    Sıfırlama Bağlantısı Gönder
                                </Button>
                            </form>
                        </Form>
                        <div className="mt-4 text-center text-sm">
                            <Link to="/login" className="underline underline-offset-4">
                                Giriş ekranına dön
                            </Link>
                        </div>
                    </CardContent>
                </Card>
                <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                    Devam ederek <a href="#">Hizmet Koşullarımızı</a> ve <a href="#">Gizlilik Politikamızı</a> kabul etmiş olursunuz.
                </div>
            </div>
        </div>
    )
}
