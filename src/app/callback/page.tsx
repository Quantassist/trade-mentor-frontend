import { redirect } from "next/navigation"

const CallBackPage = () => {
  // Better Auth handles OAuth callbacks automatically via the API route
  // This page just redirects to sign-in callback to complete the flow
  redirect("/callback/sign-in")
}

export default CallBackPage
