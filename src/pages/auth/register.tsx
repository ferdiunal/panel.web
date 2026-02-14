import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useNavigate, Link, redirect } from "react-router-dom"
import { useAppStore } from "@/stores/app"
import UniversalFormField from "@/components/form-field"
import { useAuthStore } from "@/stores"
import AuthLayout from "@/components/auth-layout"
import { useTranslation, t as tFn } from "@/hooks/useTranslation"

const formSchema = z.object({
    name: z.string().min(2, tFn("auth.register.nameMinLength")),
    email: z.email(tFn("auth.register.emailInvalid")),
    password: z.string().min(6, tFn("auth.register.passwordMinLength")),
})

export async function loader() {
    try {
        await useAppStore.getState().init()
        await useAuthStore.getState().checkSession()
        if (useAuthStore.getState().isAuthenticated) {
            return redirect('/dashboard');
        }
    } catch {
    }
}

export default function RegisterPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()

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

            toast.success(t("auth.register.success"))
            navigate("/login")
        } catch (error: any) {
            toast.error(error.response?.data?.error || t("auth.register.failed"))
        }
    }

    return (
        <AuthLayout>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{t("auth.register.title")}</CardTitle>
                    <CardDescription>
                        {t("auth.register.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                            <UniversalFormField
                                control={form.control}
                                name="name"
                                label={t("auth.register.name")}
                                placeholder={t("auth.register.namePlaceholder")}
                            />
                            <UniversalFormField
                                control={form.control}
                                name="email"
                                label={t("auth.register.email")}
                                placeholder={t("auth.register.emailPlaceholder")}
                            />
                            <UniversalFormField
                                control={form.control}
                                name="password"
                                label={t("auth.register.password")}
                                type="password"
                            />
                            <Button type="submit" className="w-full">
                                {t("auth.register.submit")}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        {t("auth.register.hasAccount")}{" "}
                        <Link to="/login" className="underline underline-offset-4">
                            {t("auth.register.login")}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
