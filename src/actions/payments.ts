"use server"

import { client } from "@/lib/prisma"
import Stripe from "stripe"
import { onAuthenticatedUser } from "./auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  typescript: true,
  apiVersion: "2025-08-27.basil",
})

export const onGetStripeClientSecret = async () => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "usd",
      amount: 9900,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    if (paymentIntent) {
      return { secret: paymentIntent.client_secret }
    }
  } catch (error) {
    return { status: 400, message: "Failed to load form" }
  }
}

export const onTransferCommission = async (destination: string) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: 3960,
      currency: "usd",
      destination,
    })

    if (transfer) {
      return { status: 200 }
    }
  } catch (error) {
    return { status: 400 }
  }
}

export const onGetActiveSubscription = async (groupid: string) => {
  try {
    const subscription = await client.subscription.findFirst({
      where: {
        groupId: groupid,
        active: true,
      },
    })

    if (subscription) {
      return { status: 200, subscription }
    }
    return { status: 404 }
  } catch (error) {
    return { status: 400 }
  }
}

export const onGetGroupSubscriptionPaymentIntent = async (groupid: string) => {
  try {
    const price = await client.subscription.findFirst({
      where: {
        groupId: groupid,
        active: true,
      },
      select: {
        price: true,
        Group: {
          select: {
            User: {
              select: {
                stripeId: true,
              },
            },
          },
        },
      },
    })

    if (price && price.price) {
      const paymentIntent = await stripe.paymentIntents.create(
        {
          currency: "usd",
          amount: price?.price * 100,
          automatic_payment_methods: {
            enabled: true,
          },
        },
        { stripeAccount: price?.Group?.User?.stripeId! },
      )

      if (paymentIntent) {
        return { secret: paymentIntent.client_secret }
      }
    }
  } catch (error) {
    return { status: 400, message: "Failed to load form" }
  }
}

export const onCreateNewGroupSubscription = async (
  groupid: string,
  price: string,
) => {
  try {
    const subscription = await client.group.update({
      where: {
        id: groupid,
      },
      data: {
        subscription: {
          create: {
            price: parseInt(price),
          },
        },
      },
    })

    if (subscription) {
      return { status: 200, message: "Subscription created successfully" }
    }
  } catch (error) {
    return { status: 400, message: "Failed to create subscription" }
  }
}

export const onActivateSubscription = async (id: string) => {
  try {
    const status = await client.subscription.findUnique({
      where: {
        id,
      },
      select: {
        active: true,
      },
    })

    if (!status) {
      return { status: 404, message: "Subscription not found" }
    }

    if (status.active) {
      return { status: 200, message: "Subscription already active" }
    }

    // Deactivate current active subscription if exists
    const current = await client.subscription.findFirst({
      where: {
        active: true,
      },
      select: {
        id: true,
      },
    })

    if (current && current.id) {
      const deactivate = await client.subscription.update({
        where: {
          id: current.id,
        },
        data: {
          active: false,
        },
      })

      if (!deactivate) {
        return {
          status: 400,
          message: "Failed to deactivate current subscription",
        }
      }
    }

    // Activate the new subscription
    const activateNew = await client.subscription.update({
      where: {
        id,
      },
      data: {
        active: true,
      },
    })

    if (!activateNew) {
      return { status: 400, message: "Failed to activate subscription" }
    }

    return { status: 200, message: "New plan activated" }
  } catch (error) {
    console.log(error)
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetStripeIntegration = async () => {
  try {
    const user = await onAuthenticatedUser()
    const stripeId = await client.user.findUnique({
      where: {
        id: user?.id,
      },
      select: {
        stripeId: true,
      },
    })

    if (stripeId) {
      return stripeId.stripeId
    }
  } catch (error) {
    return { status: 400 }
  }
}
