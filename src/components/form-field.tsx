import type { Control, FieldValues, Path } from "react-hook-form"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface UniversalFormFieldProps<T extends FieldValues> {
    control: Control<T>
    name: Path<T>
    label: string
    placeholder?: string
    type?: React.HTMLInputTypeAttribute
    description?: string
}

function UniversalFormField<T extends FieldValues>({
    control,
    name,
    label,
    placeholder,
    type = "text",
    description,
}: UniversalFormFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input type={type} placeholder={placeholder} {...field} />
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

UniversalFormField.displayName = "UniversalFormField"

export default UniversalFormField
