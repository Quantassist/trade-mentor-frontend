import { onGetAffiliateLink } from "@/actions/groups"
import { CopyButton } from "@/components/global/copy-button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"

type Props = {
  params: Promise<{ groupid: string }>
}

const Affiliates = async ({ params }: Props) => {
  const { groupid } = await params
  const affiliate = await onGetAffiliateLink(groupid)
  return (
    <div className="flex flex-col items-start p-5">
      <Card className="border-themeGray bg-[#1A1A1D] p-5">
        <CardTitle className="text-3xl">Affiliate Link</CardTitle>
        <CardDescription className="text-themeTextGray">
          Create and share an invitation link
        </CardDescription>
        <div className="flex flex-col mt-8 gap-y-2">
          <div className="bg-black border-themeGray p-3 rounded-lg flex gap-x-5 items-center">
            {process.env.NEXT_PUBLIC_BASE_URL}/affiliates/
            {affiliate.affiliate?.id}
            <CopyButton
              content={`${process.env.NEXT_PUBLIC_BASE_URL}/affiliates/${affiliate.affiliate?.id}`}
            />
          </div>
          <CardDescription className="text-themeTextGray">
            This link will redirect users to the main page where they can
            purchase or request memberships
          </CardDescription>
        </div>
      </Card>
    </div>
  )
}
export default Affiliates
