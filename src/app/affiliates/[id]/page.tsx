import { onVerifyAffiliateLink } from "@/actions/groups"
import { redirect } from "next/navigation"

const AffiliatesPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const status = await onVerifyAffiliateLink(id)

  if (status.status === 200) {
    return redirect(`/group/create?affiliate=${id}`)
  } else if (status.status !== 200) {
    return redirect(`/`)
  }
}

export default AffiliatesPage
