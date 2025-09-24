"use client"
import { NoResult } from "@/components/global/search/no-result"
import { useGroupList } from "@/hooks/groups"
import dynamic from "next/dynamic"
import { GroupCard } from "./group-card"
import { PaginatedGroups } from "./paginated-groups"

const InfiniteScrollObserver = dynamic(
  () =>
    import("@/components/global/infinite-scroll").then(
      (component) => component.InfiniteScrollObserver,
    ),
  { ssr: false },
)

export type GroupStateProps = {
  id: string
  name: string
  category: string
  createdAt: Date
  htmlDescription: string | null
  userId: string
  thumbnail: string | null
  description: string | null
  privacy: "PUBLIC" | "PRIVATE"
  jsonDescription: string | null
  gallery: string[]
}

export const GroupList = ({ category }: { category: string }) => {
  const { groups, status } = useGroupList("groups")

  return (
    <div className="container grid md:grid-cols-2 grid-cols-1 lg:grid-cols-3 gap-6 mt-16">
      {status === 200 ? (
        groups.map((group) => <GroupCard key={group.id} {...group} />)
      ) : (
        <NoResult />
      )}
      {groups && groups.length > 5 && (
        <InfiniteScrollObserver
          action="GROUPS"
          identifier={category}
          paginate={groups.length}
        >
          <PaginatedGroups />
        </InfiniteScrollObserver>
      )}
    </div>
  )
}
