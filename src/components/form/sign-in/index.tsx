"use client"

import { FormGenerator } from "@/components/global/form-generator"
import { Loader } from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { GROUPLE_CONSTANTS } from "@/constants"
import { useAuthSignIn } from "@/hooks/authentication"

export const SignInForm = () => {
  const { isPending, onAuthenticateUser, register, errors } = useAuthSignIn()
  return (
    <form className="flex flex-col gap-3 mt-10" onSubmit={onAuthenticateUser}>
      {GROUPLE_CONSTANTS.signInForm.map((field) => (
        <FormGenerator
          {...field}
          key={field.id}
          register={register}
          errors={errors}
          label={field.label}
        />
      ))}
      <Button type="submit" className="rounded-2xl">
        <Loader loading={isPending}>Sign In with Email</Loader>
      </Button>
    </form>
  )
}
