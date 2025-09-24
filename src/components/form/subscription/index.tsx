"use client"
import { SubscriptionCard } from "@/app/group/[groupid]/settings/subscriptions/_components/card"
import { FormGenerator } from "@/components/global/form-generator"
import { GlassModal } from "@/components/global/glass-modal"
import { Loader } from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGroupSubscription } from "@/hooks/payment"
import { Tag } from "lucide-react"

type GroupSubscriptionFormProps = {
  groupid: string
}

export const GroupSubscriptionForm = ({
  groupid,
}: GroupSubscriptionFormProps) => {
  const { onCreateNewSubscription, register, errors, isPending, variables } =
    useGroupSubscription(groupid)

  return (
    <>
      <GlassModal
        trigger={
          <span>
            <Card className="flex rounded-xl items-center gap-x-2 text-themeGray cursor-pointer justify-center aspect-video border-dashed bg-themeBlack border-themeGray">
              <Tag />
              <p>Add a price</p>
            </Card>
          </span>
        }
        title="Create a subscription"
        description="Create a subsciription plan for your grouple group"
      >
        <form
          onSubmit={onCreateNewSubscription}
          className="flex flex-col gap-y-3"
        >
          <FormGenerator
            register={register}
            errors={errors}
            inputType="input"
            type="text"
            placeholder="Add a price..."
            name="price"
          />
          <Button>
            <Loader loading={isPending}>Create</Loader>
          </Button>
        </form>
      </GlassModal>
      {isPending && variables && (
        <SubscriptionCard optimistic price={`${variables.price}`} members="0" />
      )}
    </>
  )
}
