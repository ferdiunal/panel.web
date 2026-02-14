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
import { useAuthStore } from "@/stores"
import AuthLayout from "@/components/auth-layout"
import { useTranslation, t as tFn } from "@/hooks/useTranslation"

const formSchema = z.object({
    email: z.string().email({ message: tFn("auth.forgotPassword.emailInvalid") }),
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

export default function ForgotPasswordPage() {
    const { t } = useTranslation()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await api.post("/auth/forgot-password", values)
            toast.success(t("auth.forgotPassword.success"))
        } catch (error: any) {
            toast.error(error.response?.data?.error || t("auth.forgotPassword.failed"))
        }
    }

    return (
        <AuthLayout>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{t("auth.forgotPassword.title")}</CardTitle>
                    <CardDescription>
                        {t("auth.forgotPassword.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                            <UniversalFormField
                                control={form.control}
                                name="email"
                                label={t("auth.forgotPassword.email")}
                                placeholder={t("auth.forgotPassword.emailPlaceholder")}
                            />
                            <Button type="submit" className="w-full">
                                {t("auth.forgotPassword.submit")}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        <Link to="/login" className="underline underline-offset-4">
                            {t("auth.forgotPassword.backToLogin")}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
