"use client"

import { StripeElements } from "@/components/global/stripe/elements"
import { PaymentForm } from "./payment-form"

type PaymentFormProps = {
  userId: string
  affiliate: boolean
  stripeId?: string
}

export const CreateGroup = ({
  userId,
  affiliate,
  stripeId,
}: PaymentFormProps) => {
  return (
    <StripeElements>
      <PaymentForm userId={userId} affiliate={affiliate} stripeId={stripeId} />
    </StripeElements>
  )
}
