/**
 * Data Access Layer - Payments
 * Pure data fetching functions that can be used by API routes and Server Components
 */

import { client } from "@/lib/prisma"
import { cache } from "react"

export const getActiveSubscription = cache(async (groupId: string) => {
  try {
    const subscription = await client.subscription.findFirst({
      where: {
        groupId,
        active: true,
      },
    })

    if (subscription) {
      return { status: 200, subscription }
    }
    return { status: 404 }
  } catch (error) {
    console.error("Error fetching active subscription:", error)
    return { status: 400 }
  }
})

export const getStripeIntegration = cache(async (groupId: string) => {
  try {
    const group = await client.group.findUnique({
      where: { id: groupId },
      select: {
        User: {
          select: {
            stripeId: true,
          },
        },
      },
    })

    if (!group?.User?.stripeId) {
      return { status: 404, message: "No Stripe integration found" }
    }

    return {
      status: 200,
      integration: {
        stripeId: group.User.stripeId,
        connected: true,
      },
    }
  } catch (error) {
    console.error("Error fetching Stripe integration:", error)
    return { status: 400, message: "Failed to fetch Stripe integration" }
  }
})
