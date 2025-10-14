"use client"

import { DropDown } from "@/components/global/drop-down"
import { Button } from "@/components/ui/button"
import { CarotSort } from "@/icons"
import { Group } from "lucide-react"
import Link from "next/link"

type GroupDropDownProps = {
  groups:
    | {
        status: number
        groups: {
          channel: {
            id: string
          }[]
          id: string
          name: string
          icon: string | null
        }[]
      }
    | {
        status: number
        groups?: undefined
      }
}

export const GroupDropDown = ({ groups }: GroupDropDownProps) => {
  const { groups: userGroups } = groups
  return (
    <DropDown
      title="Owned Groups"
      trigger={
        <Button
          variant="ghost"
          className="rounded-2xl hover:bg-themeGray font-medium flex gap-2"
        >
          TradeFlix
          <CarotSort />
        </Button>
      }
    >
      {userGroups &&
        userGroups.length > 0 &&
        userGroups.map((item) => (
          <Link
            key={item.id}
            href={`/group/${item.id}/feed/${item.channel[0].id}`}
          >
            <Button
              variant="ghost"
              className="flex gap-2 w-full justify-start hover:bg-themeGray items-center"
            >
              <Group />
              {item.name}
            </Button>
          </Link>
        ))}
    </DropDown>
  )
}
