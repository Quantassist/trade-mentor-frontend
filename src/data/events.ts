/**
 * Data Access Layer - Events
 * Pure data fetching functions that can be used by API routes and Server Components
 */

import { client } from "@/lib/prisma"
import { cache } from "react"

export const getGroupEvents = cache(async (
  groupId: string,
  options?: {
    upcoming?: boolean
    published?: boolean
    limit?: number
    userId?: string
  }
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
      events: events.map((event: any) => ({
        ...event,
        attendeeCount: event._count.attendees,
        isRegistered: options?.userId ? (event.attendees as any[])?.length > 0 : false,
      })),
    }
  } catch (error) {
    console.error("Error fetching group events:", error)
    return { status: 400, message: "Failed to fetch events" }
  }
})

export const getEventById = cache(async (eventId: string) => {
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
})

export const checkEventRegistration = cache(async (eventId: string, userId: string) => {
  try {
    const attendee = await client.eventAttendee.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    })

    return { status: 200, registered: !!attendee }
  } catch (error) {
    console.error("Error checking event registration:", error)
    return { status: 400, message: "Failed to check registration" }
  }
})
