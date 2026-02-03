import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useNavigate, Link, redirect } from "react-router-dom"
import { initService } from "@/services/init"
import UniversalFormField from "@/components/form-field"
import { GalleryVerticalEnd } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalı"),
    email: z.email("Geçerli bir e-posta adresi girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
})

export async function loader() {
    try {
        const data = await initService.fetchInit();
        if (!data.features || !data.features.register) {
            return redirect("/login");
        }
        return null;
    } catch (error) {
        return redirect("/login");
    }
}

export default function RegisterPage() {
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await api.post("/auth/sign-up/email", {
                name: values.name,
                email: values.email,
                password: values.password
            })

            toast.success("Hesap oluşturuldu! Giriş yapabilirsiniz.")
            navigate("/login")
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Kayıt başarısız")
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
                        <CardTitle className="text-xl">Kayıt Ol</CardTitle>
                        <CardDescription>
                            Hesap oluşturmak için bilgilerinizi girin
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                                <UniversalFormField
                                    control={form.control}
                                    name="name"
                                    label="Ad Soyad"
                                    placeholder="John Doe"
                                />
                                <UniversalFormField
                                    control={form.control}
                                    name="email"
                                    label="E-posta"
                                    placeholder="m@example.com"
                                />
                                <UniversalFormField
                                    control={form.control}
                                    name="password"
                                    label="Şifre"
                                    type="password"
                                />
                                <Button type="submit" className="w-full">
                                    Hesap Oluştur
                                </Button>
                            </form>
                        </Form>
                        <div className="mt-4 text-center text-sm">
                            Zaten hesabınız var mı?{" "}
                            <Link to="/login" className="underline underline-offset-4">
                                Giriş Yap
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
