import { onAuthenticatedUser } from "@/actions/auth"
import { client } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as string, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
}) // TODO: make it singleton

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const groupid = searchParams.get("groupid")

    const account = await stripe.accounts.create({
      type: "standard",
      country: "US",
      business_type: "individual",
    })

    if (account) {
      // TODO:  Use real integration
      console.log(account)
      const user = await onAuthenticatedUser()
      const integrateStripeAccount = await client.user.update({
        where: {
          id: user?.id,
        },
        data: {
          stripeId: account.id,
        },
      })

      if (integrateStripeAccount) {
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/callback/stripe/refresh`,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/group/${groupid}/settings/integrations`,
          type: "account_onboarding",
        })
        console.log(accountLink)
        return NextResponse.json({
          url: accountLink.url,
        })
      }
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({
      error: "Something went wrong",
    })
  }
}
