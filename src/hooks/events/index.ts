"use client"

import {
    onCheckEventRegistration,
    onCreateEvent,
    onDeleteEvent,
    onGetGroupEvents,
    onPublishEvent,
    onRegisterForEvent,
    onUnregisterFromEvent,
} from "@/actions/events"
import { CreateEventSchema } from "@/components/form/event/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

export const useCreateEvent = (
  groupId: string,
  userId: string,
  onSuccess?: () => void,
) => {
  const queryClient = useQueryClient()
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<z.infer<typeof CreateEventSchema>>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      eventType: "LIVE_CLASS",
      timezone: "UTC",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-event"],
    mutationFn: async (values: z.infer<typeof CreateEventSchema>) => {
      const startDateTime = new Date(`${values.startDate}T${values.startTime}`)
      let endDateTime: Date | undefined
      if (values.endDate && values.endTime) {
        endDateTime = new Date(`${values.endDate}T${values.endTime}`)
      }

      const result = await onCreateEvent({
        groupId,
        createdById: userId,
        title: values.title,
        description: values.description,
        eventType: values.eventType as any,
        startTime: startDateTime,
        endTime: endDateTime,
        timezone: values.timezone,
        location: values.location,
        meetingUrl: values.meetingUrl || undefined,
        maxAttendees: values.maxAttendees ? parseInt(values.maxAttendees) : undefined,
      })

      if (result.status !== 200) {
        throw new Error(result.message || "Failed to create event")
      }

      return result
    },
    onSuccess: () => {
      reset()
      toast.success("Event created successfully!")
      queryClient.invalidateQueries({ queryKey: ["group-events", groupId] })
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onCreateEventSubmit = handleSubmit((values) => mutate(values))

  return {
    register,
    errors,
    onCreateEvent: onCreateEventSubmit,
    isPending,
    setValue,
    watch,
  }
}

export const useGroupEvents = (
  groupId: string,
  options?: { upcoming?: boolean; published?: boolean; userId?: string },
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["group-events", groupId, options],
    queryFn: () => onGetGroupEvents(groupId, options),
  })

  return {
    events: data?.status === 200 ? data.events : [],
    isLoading,
    hasError: !!error || data?.status !== 200,
  }
}

export const useEventActions = (groupId: string) => {
  const queryClient = useQueryClient()

  const { mutate: publishEvent, isPending: isPublishing } = useMutation({
    mutationKey: ["publish-event"],
    mutationFn: async ({ eventId, publish }: { eventId: string; publish: boolean }) => {
      const result = await onPublishEvent(eventId, publish)
      if (result.status !== 200) {
        throw new Error(result.message)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Event updated!")
      queryClient.invalidateQueries({ queryKey: ["group-events", groupId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const { mutate: deleteEvent, isPending: isDeleting } = useMutation({
    mutationKey: ["delete-event"],
    mutationFn: async (eventId: string) => {
      const result = await onDeleteEvent(eventId)
      if (result.status !== 200) {
        throw new Error(result.message)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Event deleted!")
      queryClient.invalidateQueries({ queryKey: ["group-events", groupId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    publishEvent,
    isPublishing,
    deleteEvent,
    isDeleting,
  }
}

export const useEventRegistration = (eventId: string, userId: string, groupId: string) => {
  const queryClient = useQueryClient()

  const { data: registrationData } = useQuery({
    queryKey: ["event-registration", eventId, userId],
    queryFn: () => onCheckEventRegistration(eventId, userId),
    enabled: !!userId,
  })

  const { mutate: registerForEvent, isPending: isRegistering } = useMutation({
    mutationKey: ["register-event"],
    mutationFn: async () => {
      const result = await onRegisterForEvent(eventId, userId)
      if (result.status !== 200) {
        throw new Error(result.message)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Registered for event!")
      queryClient.invalidateQueries({ queryKey: ["event-registration", eventId, userId] })
      queryClient.invalidateQueries({ queryKey: ["group-events", groupId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const { mutate: unregisterFromEvent, isPending: isUnregistering } = useMutation({
    mutationKey: ["unregister-event"],
    mutationFn: async () => {
      const result = await onUnregisterFromEvent(eventId, userId)
      if (result.status !== 200) {
        throw new Error(result.message)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Unregistered from event")
      queryClient.invalidateQueries({ queryKey: ["event-registration", eventId, userId] })
      queryClient.invalidateQueries({ queryKey: ["group-events", groupId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    isRegistered: registrationData?.isRegistered ?? false,
    registerForEvent,
    unregisterFromEvent,
    isRegistering,
    isUnregistering,
  }
}
