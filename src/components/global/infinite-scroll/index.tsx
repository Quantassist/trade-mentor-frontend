"use client"

import { useInfiniteScroll } from "@/hooks/infinite-scroll"
import { Skeleton } from "../skeleton"

type InfiniteScrollObserverProps = {
  action: "GROUPS" | "POSTS"
  children: React.ReactNode
  identifier: string
  paginate: number
  search?: boolean
  loading?: "POST"
}

export const InfiniteScrollObserver = ({
  action,
  children,
  identifier,
  paginate,
  search,
  loading,
}: InfiniteScrollObserverProps) => {
  const { observerElement, isFetching } = useInfiniteScroll(
    action,
    identifier,
    paginate,
    search,
  )

  return (
    <>
      {children}
      <div ref={observerElement}>
        {isFetching && <Skeleton element={loading || "CARD"} />}
      </div>
    </>
  )
}
