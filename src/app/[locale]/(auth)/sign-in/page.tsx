import { SignInForm } from "@/components/form/sign-in"
import { GoogleAuthButton } from "@/components/global/google-oauth-button"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl"

const SignInPage = () => {
  const t = useTranslations("auth")
  return (
    <>
      {/* <h5 className="font-bold text-base text-themeTextWhite">Login</h5>
      <p className="text-themeTextGray leading-tight">
        {t("hero.subtitle")}
      </p> */}
      <SignInForm />
      <div className="my-10 w-full relative">
        <div className="bg-black p-3 absolute text-themeTextGray text-xs top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {t("separator.orContinueWith")}
        </div>
        <Separator orientation="horizontal" className="bg-themeGray" />
      </div>
      <GoogleAuthButton method="signin" />
    </>
  )
}

export default SignInPage
