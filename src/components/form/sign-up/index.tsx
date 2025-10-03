"use client"

import { FormGenerator } from "@/components/global/form-generator"
import { Loader } from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { GROUPLE_CONSTANTS } from "@/constants"
import { useAuthSignUp } from "@/hooks/authentication"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"

const OtpInput = dynamic(
  () =>
    import("@/components/global/otp-input").then(
      (component) => component.default,
    ),
  { ssr: false },
)

type Props = { selectedLocale?: "en" | "hi" }

export const SignUpForm = ({ selectedLocale }: Props) => {
  const t = useTranslations("auth")
  const {
    register,
    errors,
    verifying,
    creating,
    onGenerateCode,
    onInitiateUserRegistration,
    code,
    setCode,
    getValues,
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
      onSubmit={onInitiateUserRegistration}
      className="flex flex-col gap-3 mt-5"
    >
      {verifying ? (
        <div className="flex justify-center mb-5">
          <OtpInput otp={code} setOtp={setCode} />
        </div>
      ) : (
        localizedFields.map((field) => (
          <FormGenerator
            {...field}
            key={field.id}
            register={register}
            errors={errors}
            label={field.label}
          />
        ))
      )}
      {verifying ? (
        <Button type="submit" className="rounded-2xl">
          <Loader loading={creating}>{t("buttons.signUpWithEmail")}</Loader>
        </Button>
      ) : (
        <Button
          type="button"
          className="rounded-2xl"
          onClick={() =>
            onGenerateCode(getValues("email"), getValues("password"))
          }
        >
          <Loader loading={false}>{t("buttons.generateCode")}</Loader>
        </Button>
      )}
    </form>
  )
}
