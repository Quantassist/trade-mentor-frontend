"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useSelectSubscription } from "@/hooks/groups"
import { BadgePlus } from "lucide-react"
import SubscriptionCard from "../subscription-card"

const SelectSubscription = () => {
  const { selected, onSelected, subscriptionOptions, handleRemove } =
    useSelectSubscription()

  return (
    <div className="grid grid-cols-4 gap-8 pt-8">
      <Card className="bg-[#101011] border-themeGray hover:bg-themeBlack transition duration-100 cursor-pointer border-dashed rounded-xl">
        <CardContent className="opacity-20 flex gap-x-2 p-0 justify-center items-center h-full">
          <BadgePlus />
          <p>Add Price</p>
        </CardContent>
      </Card>
      {subscriptionOptions.map((option) => (
        <SubscriptionCard
          key={option.value}
          selected={selected}
          onSelected={onSelected}
          option={option}
          handleRemove={handleRemove}
        />
      ))}
    </div>
  )
}

export default SelectSubscription
