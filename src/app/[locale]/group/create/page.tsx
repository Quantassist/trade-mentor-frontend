import { onAuthenticatedUser } from "@/actions/auth"
import { onGetAffiliateInfo } from "@/actions/groups"
import { CreateGroup } from "@/components/form/create-group"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { User } from "lucide-react"
import { redirect } from "next/navigation"

const GroupCreatePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [affiliate: string]: string }>
}) => {
  const user = await onAuthenticatedUser()

  const { affiliate: affiliateParam } = await searchParams

  const affiliate = await onGetAffiliateInfo(affiliateParam)

  if (!user || !user.id) redirect("/sign-in")
  return (
    <>
      <div className="px-7 flex flex-col">
        <h5 className="font-bold text-base text-themeTextWhite">
          Payment Method
        </h5>
        <p className="text-themeTextGray leading-tight">
          Free for 14 days, then $98/month. Cancel anytime.All features.
          Unlimited everything. No hidden fees.
        </p>
        {affiliate.status === 200 && (
          <div className="w-full mt-5 flex justify-center items-center gap-x-2 italic text-themeTextGray text-sm">
            You were referred by
            <Avatar>
              <AvatarImage src={affiliate.user?.group.User.image as string} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
            {affiliate.user?.group.User.firstname}{" "}
            {affiliate.user?.group.User.lastname}
          </div>
        )}
      </div>
      <CreateGroup
        userId={user.id}
        affiliate={affiliate.status === 200 ? true : false}
        stripeId={affiliate.user?.group.User.stripeId || ""}
      />
    </>
  )
}

export default GroupCreatePage
