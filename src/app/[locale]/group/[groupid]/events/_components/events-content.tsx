"use client"

import { CreateEventForm } from "@/components/form/event"
import { GlassModal } from "@/components/global/glass-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEventActions, useEventRegistration, useGroupEvents } from "@/hooks/events"
import { cn } from "@/lib/utils"
import {
    Calendar,
    CalendarCheck,
    CalendarPlus,
    Clock,
    ExternalLink,
    MapPin,
    MoreVertical,
    Trash2,
    Users,
    Video
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

type EventsContentProps = {
  groupid: string
  userid: string
  canCreateEvent: boolean
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  LIVE_CLASS: "Live Class",
  WEBINAR: "Webinar",
  WORKSHOP: "Workshop",
  QA_SESSION: "Q&A Session",
  MEETUP: "Meetup",
  OTHER: "Event",
}

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LIVE_CLASS: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  WEBINAR: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  WORKSHOP: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/30" },
  QA_SESSION: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  MEETUP: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  OTHER: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" },
}

export const EventsContent = ({ groupid, userid, canCreateEvent }: EventsContentProps) => {
  const t = useTranslations("events")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { events, isLoading } = useGroupEvents(groupid, { upcoming: true, published: true, userId: userid })
  const { events: allEvents } = useGroupEvents(groupid, { userId: userid })
  const { deleteEvent, isDeleting, publishEvent, isPublishing } = useEventActions(groupid)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    )
  }

  const allPublishedEvents = (events || []) as any[]
  const draftEvents = canCreateEvent 
    ? (allEvents || []).filter((e: any) => !e.isPublished) 
    : []
  
  // Separate registered events from upcoming events
  const myRegisteredEvents = allPublishedEvents.filter((e: any) => e.isRegistered)
  const upcomingEvents = allPublishedEvents.filter((e: any) => !e.isRegistered)

  return (
    <div className="flex flex-col gap-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Calendar className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-bold text-3xl md:text-4xl text-white">{t("title")}</h1>
            <p className="text-themeTextGray">{t("subtitle")}</p>
          </div>
        </div>

        {canCreateEvent && (
          <GlassModal
            title={t("createEvent")}
            description={t("createEventDescription")}
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            trigger={
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2">
                <CalendarPlus className="h-4 w-4" />
                {t("createEvent")}
              </Button>
            }
          >
            <CreateEventForm 
              groupId={groupid} 
              userId={userid} 
              onSuccess={() => setIsCreateOpen(false)} 
            />
          </GlassModal>
        )}
      </div>

      {/* Draft Events (Owner Only) */}
      {canCreateEvent && draftEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">{t("draftEvents")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftEvents.map((event: any) => (
              <EventCard
                key={event.id}
                event={event}
                userid={userid}
                groupid={groupid}
                canManage={canCreateEvent}
                isDraft
                onPublish={() => publishEvent({ eventId: event.id, publish: true })}
                onDelete={() => deleteEvent(event.id)}
                isDeleting={isDeleting}
                isPublishing={isPublishing}
              />
            ))}
          </div>
        </div>
      )}

      {/* My Registered Events */}
      {myRegisteredEvents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">{t("mySchedule")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRegisteredEvents.map((event: any) => (
              <EventCard
                key={event.id}
                event={event}
                userid={userid}
                groupid={groupid}
                canManage={canCreateEvent}
                onDelete={() => deleteEvent(event.id)}
                isDeleting={isDeleting}
                isMyEvent
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">{t("upcomingEvents")}</h2>
        {upcomingEvents.length === 0 && myRegisteredEvents.length === 0 ? (
          <Card className="bg-[#161a20] border-themeGray/60 rounded-xl p-12 text-center">
            <Calendar className="h-12 w-12 text-themeTextGray mx-auto mb-4" />
            <p className="text-themeTextGray">{t("noUpcoming")}</p>
            {canCreateEvent && (
              <p className="text-sm text-themeTextGray mt-2">
                {t("createToStart")}
              </p>
            )}
          </Card>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-themeTextGray text-sm">{t("noOtherUpcoming")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event: any) => (
              <EventCard
                key={event.id}
                event={event}
                userid={userid}
                groupid={groupid}
                canManage={canCreateEvent}
                onDelete={() => deleteEvent(event.id)}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type EventCardProps = {
  event: any
  userid: string
  groupid: string
  canManage: boolean
  isDraft?: boolean
  isMyEvent?: boolean
  onPublish?: () => void
  onDelete: () => void
  isDeleting: boolean
  isPublishing?: boolean
}

const EventCard = ({ 
  event, 
  userid, 
  groupid, 
  canManage, 
  isDraft,
  isMyEvent, 
  onPublish, 
  onDelete,
  isDeleting,
  isPublishing,
}: EventCardProps) => {
  const { isRegistered, registerForEvent, unregisterFromEvent, isRegistering, isUnregistering } = 
    useEventRegistration(event.id, userid, groupid)

  const startDate = new Date(event.startTime)
  const endDate = event.endTime ? new Date(event.endTime) : null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const typeColors = EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.OTHER

  return (
    <Card className={cn(
      "bg-[#161a20] border-themeGray/60 rounded-xl overflow-hidden transition-all hover:border-themeGray/80",
      isDraft && "border-dashed border-amber-500/40",
      isMyEvent && "border-emerald-500/30"
    )}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full border",
              typeColors.bg,
              typeColors.text,
              typeColors.border
            )}>
              {EVENT_TYPE_LABELS[event.eventType] || "Event"}
            </span>
            {isDraft && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Draft
              </span>
            )}
            {isMyEvent && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Registered
              </span>
            )}
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4 text-themeTextGray" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1a1d] border-themeGray">
                {isDraft && onPublish && (
                  <DropdownMenuItem 
                    onClick={onPublish}
                    disabled={isPublishing}
                    className="text-emerald-400 hover:bg-themeGray"
                  >
                    Publish Event
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="text-red-400 hover:bg-themeGray"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
          {event.title}
        </h3>

        {/* Date & Time */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-themeTextGray">
            <Calendar className="h-4 w-4 text-themeTextGray/60" />
            <span>{formatDate(startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-themeTextGray">
            <Clock className="h-4 w-4 text-themeTextGray/60" />
            <span>
              {formatTime(startDate)}
              {endDate && ` - ${formatTime(endDate)}`}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-themeTextGray">
              <MapPin className="h-4 w-4 text-themeTextGray/60" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Attendees */}
          <div className="flex items-center gap-2 text-sm text-themeTextGray">
            <Users className="h-4 w-4 text-themeTextGray/60" />
            <span>
              {event.attendeeCount || 0} registered
              {event.maxAttendees && ` / ${event.maxAttendees} max`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Join Meeting Button - Most prominent when registered and has URL */}
          {event.meetingUrl && (isRegistered || isMyEvent) && (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 gap-2"
              onClick={() => window.open(event.meetingUrl, "_blank")}
            >
              <Video className="h-4 w-4" />
              Join Meeting
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}

          {!isDraft && !isMyEvent && (
            <>
              {isRegistered ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-themeGray/60 text-themeTextGray hover:bg-themeGray/30"
                  onClick={() => unregisterFromEvent()}
                  disabled={isUnregistering}
                >
                  Cancel Registration
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  onClick={() => registerForEvent()}
                  disabled={isRegistering}
                >
                  Register
                </Button>
              )}
            </>
          )}

          {isMyEvent && !event.meetingUrl && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-themeGray/60 text-themeTextGray hover:bg-themeGray/30"
              onClick={() => unregisterFromEvent()}
              disabled={isUnregistering}
            >
              Cancel Registration
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
