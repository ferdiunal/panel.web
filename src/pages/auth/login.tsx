import { useForm } from "react-hook-form"
import { GalleryVerticalEnd } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthStore } from "@/stores/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useNavigate, Link } from "react-router-dom"
import { redirect } from "react-router-dom"
import UniversalFormField from "@/components/form-field"
import { Form } from "@/components/ui/form"
import { useLoaderData } from "react-router-dom"
import { initService, type InitResponse } from "@/services/init"


const formSchema = z.object({
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
    password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
})


export async function loader() {
    // 1. Check Session
    try {
        const { data } = await api.get('/auth/session');
        if (data.session) {
            return redirect("/dashboard");
        }
    } catch (e) {
        // Not logged in
    }

    // 2. Fetch Init Data
    try {
        const initData = await initService.fetchInit()
        return initData
    } catch (error) {
        return null
    }
}

export default function LoginPage() {
    const { login } = useAuthStore()
    const navigate = useNavigate()
    const initData = useLoaderData() as InitResponse || {
        features: { register: false, forgot_password: false },
        oauth: { google: false },
        version: "1.0.0"
    }

    // Double check structure in case of partial object from malformed JSON/HTML
    const safeInitData = {
        features: initData?.features || { register: false, forgot_password: false },
        oauth: initData?.oauth || { google: false },
        version: initData?.version || "1.0.0"
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // Login Request
            await api.post("/auth/sign-in/email", values)

            // Fetch Session & User
            const { data } = await api.get("/auth/session")
            if (data.user) {
                login(data.user)
                toast.success("Giriş başarılı")
                navigate("/dashboard")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Giriş başarısız")
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
                        <CardTitle className="text-xl">Hoş geldiniz</CardTitle>
                        {safeInitData.oauth.google && (
                            <CardDescription>
                                Google hesabınızla giriş yapın
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            {safeInitData.oauth.google && (
                                <div className="flex flex-col gap-4">
                                    <Button variant="outline" className="w-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                                            <path
                                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        Google ile giriş yap
                                    </Button>
                                </div>
                            )}
                            {safeInitData.oauth.google && (
                                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                        veya e-posta ile
                                    </span>
                                </div>
                            )}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                                    <UniversalFormField
                                        control={form.control}
                                        name="email"
                                        label="E-posta"
                                        placeholder="m@example.com"
                                    />
                                    <div className="grid gap-2">
                                        <UniversalFormField
                                            control={form.control}
                                            name="password"
                                            label="Şifre"
                                            type="password"
                                        />
                                        {safeInitData.features.forgot_password && (
                                            <div className="flex items-center justify-end">
                                                <Link
                                                    to="/forgot-password"
                                                    className="text-sm underline-offset-4 hover:underline"
                                                >
                                                    Şifrenizi mi unuttunuz?
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Giriş Yap
                                    </Button>
                                </form>
                            </Form>
                            {safeInitData.features.register && (
                                <div className="text-center text-sm">
                                    Hesabınız yok mu?{" "}
                                    <Link to="/register" className="underline underline-offset-4">
                                        Kayıt Ol
                                    </Link>
                                </div>
                            )}
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
