import { onAuthenticatedUser, onGetUserGroupRole } from "@/actions/auth"
import { getQueryClient } from "@/lib/get-query-client"
import {
    HydrationBoundary,
    dehydrate,
} from "@tanstack/react-query"
import { EventsContent } from "./_components/events-content"

type EventsPageProps = {
  params: Promise<{ groupid: string; locale: string }>
}

const EventsPage = async ({ params }: EventsPageProps) => {
  const query = getQueryClient()
  const { groupid } = await params
  const user = await onAuthenticatedUser()
  const roleData = await onGetUserGroupRole(groupid)
  const isOwnerOrAdmin = roleData.role === "OWNER" || roleData.role === "ADMIN"

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="pb-10 container px-5 md:px-10">
        <EventsContent 
          groupid={groupid} 
          userid={user.id!} 
          canCreateEvent={isOwnerOrAdmin} 
        />
      </div>
    </HydrationBoundary>
  )
}

export default EventsPage
