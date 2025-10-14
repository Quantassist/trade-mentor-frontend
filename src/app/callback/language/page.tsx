import { Suspense } from "react"
import LanguageClient from "./client"

export default function LanguageInterstitialPage() {
  return (
    <Suspense fallback={null}>
      <LanguageClient />
    </Suspense>
  )
}
