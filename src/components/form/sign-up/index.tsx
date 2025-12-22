"use client"

import { FormGenerator } from "@/components/global/form-generator"
import { Loader } from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { GROUPLE_CONSTANTS } from "@/constants"
import { useAuthSignUp } from "@/hooks/authentication"
import { useTranslations } from "next-intl"

type Props = { selectedLocale?: "en" | "hi" }

export const SignUpForm = ({ selectedLocale }: Props) => {
  const t = useTranslations("auth")
  const {
    register,
    errors,
    isPending,
    onSignUp,
  } = useAuthSignUp({ locale: selectedLocale })
  
  const localizedFields = GROUPLE_CONSTANTS.signUpForm.map((f) => {
    const key = f.name as "firstname" | "lastname" | "email" | "password"
    return {
      ...f,
      label: t(`form.${key}.label`),
      placeholder: t(`form.${key}.placeholder`),
    }
  })
  
  return (
    <form
      onSubmit={onSignUp}
      className="flex flex-col gap-3 mt-5"
    >
      {localizedFields.map((field) => (
        <FormGenerator
          {...field}
          key={field.id}
          register={register}
          errors={errors}
          label={field.label}
        />
      ))}
      <Button type="submit" className="rounded-2xl">
        <Loader loading={isPending}>{t("buttons.signUpWithEmail")}</Loader>
      </Button>
    </form>
  )
}
