"use server"

import { client } from "@/lib/prisma"
import { EventType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export type CreateEventInput = {
  groupId: string
  createdById: string
  title: string
  description?: string
  eventType: EventType
  startTime: Date
  endTime?: Date
  timezone?: string
  location?: string
  meetingUrl?: string
  thumbnail?: string
  maxAttendees?: number
}

export const onCreateEvent = async (data: CreateEventInput) => {
  try {
    const event = await client.event.create({
      data: {
        groupId: data.groupId,
        createdById: data.createdById,
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone || "UTC",
        location: data.location,
        meetingUrl: data.meetingUrl,
        thumbnail: data.thumbnail,
        maxAttendees: data.maxAttendees,
        isPublished: false,
      },
    })

    revalidatePath(`/group/${data.groupId}/events`)
    return { status: 200, event }
  } catch (error) {
    console.error("Error creating event:", error)
    return { status: 400, message: "Failed to create event" }
  }
}

export const onUpdateEvent = async (
  eventId: string,
  data: Partial<CreateEventInput>,
) => {
  try {
    const event = await client.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone,
        location: data.location,
        meetingUrl: data.meetingUrl,
        thumbnail: data.thumbnail,
        maxAttendees: data.maxAttendees,
      },
    })

    revalidatePath(`/group/${event.groupId}/events`)
    return { status: 200, event }
  } catch (error) {
    console.error("Error updating event:", error)
    return { status: 400, message: "Failed to update event" }
  }
}

export const onDeleteEvent = async (eventId: string) => {
  try {
    const event = await client.event.delete({
      where: { id: eventId },
    })

    revalidatePath(`/group/${event.groupId}/events`)
    return { status: 200, message: "Event deleted" }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { status: 400, message: "Failed to delete event" }
  }
}

export const onPublishEvent = async (eventId: string, publish: boolean) => {
  try {
    const event = await client.event.update({
      where: { id: eventId },
      data: { isPublished: publish },
    })

    revalidatePath(`/group/${event.groupId}/events`)
    return { status: 200, event }
  } catch (error) {
    console.error("Error publishing event:", error)
    return { status: 400, message: "Failed to publish event" }
  }
}

export const onGetGroupEvents = async (
  groupId: string,
  options?: {
    upcoming?: boolean
    published?: boolean
    limit?: number
    userId?: string
  },
) => {
  try {
    const where: any = { groupId }

    if (options?.upcoming) {
      where.startTime = { gte: new Date() }
    }

    if (options?.published !== undefined) {
      where.isPublished = options.published
    }

    const events = await client.event.findMany({
      where,
      orderBy: { startTime: "asc" },
      take: options?.limit,
      include: {
        CreatedBy: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            image: true,
          },
        },
        attendees: options?.userId ? {
          where: { userId: options.userId },
          select: { id: true },
        } : false,
        _count: {
          select: { attendees: true },
        },
      },
    })

    return {
      status: 200,
      events: events.map((event) => ({
        ...event,
        attendeeCount: event._count.attendees,
        isRegistered: options?.userId ? (event.attendees as any[])?.length > 0 : false,
      })),
    }
  } catch (error) {
    console.error("Error fetching events:", error)
    return { status: 400, message: "Failed to fetch events" }
  }
}

export const onGetEventById = async (eventId: string) => {
  try {
    const event = await client.event.findUnique({
      where: { id: eventId },
      include: {
        CreatedBy: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            image: true,
          },
        },
        attendees: {
          include: {
            User: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!event) {
      return { status: 404, message: "Event not found" }
    }

    return { status: 200, event }
  } catch (error) {
    console.error("Error fetching event:", error)
    return { status: 400, message: "Failed to fetch event" }
  }
}

export const onRegisterForEvent = async (eventId: string, userId: string) => {
  try {
    const event = await client.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { attendees: true } } },
    })

    if (!event) {
      return { status: 404, message: "Event not found" }
    }

    if (event.maxAttendees && event._count.attendees >= event.maxAttendees) {
      return { status: 400, message: "Event is full" }
    }

    const existing = await client.eventAttendee.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    })

    if (existing) {
      return { status: 400, message: "Already registered" }
    }

    await client.eventAttendee.create({
      data: { eventId, userId },
    })

    revalidatePath(`/group/${event.groupId}/events`)
    return { status: 200, message: "Registered successfully" }
  } catch (error) {
    console.error("Error registering for event:", error)
    return { status: 400, message: "Failed to register" }
  }
}

export const onUnregisterFromEvent = async (eventId: string, userId: string) => {
  try {
    const attendee = await client.eventAttendee.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
      include: { Event: true },
    })

    if (!attendee) {
      return { status: 404, message: "Registration not found" }
    }

    await client.eventAttendee.delete({
      where: {
        eventId_userId: { eventId, userId },
      },
    })

    revalidatePath(`/group/${attendee.Event.groupId}/events`)
    return { status: 200, message: "Unregistered successfully" }
  } catch (error) {
    console.error("Error unregistering from event:", error)
    return { status: 400, message: "Failed to unregister" }
  }
}

export const onCheckEventRegistration = async (eventId: string, userId: string) => {
  try {
    const existing = await client.eventAttendee.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    })

    return { status: 200, isRegistered: !!existing }
  } catch (error) {
    return { status: 400, isRegistered: false }
  }
}
