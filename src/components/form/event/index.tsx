"use client"

import { Loader } from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateEvent } from "@/hooks/events"
import { ErrorMessage } from "@hookform/error-message"
import { Calendar, Clock, Link2, MapPin, Users, Video } from "lucide-react"

type CreateEventFormProps = {
  groupId: string
  userId: string
  onSuccess?: () => void
}

const EVENT_TYPES = [
  { value: "LIVE_CLASS", label: "Live Class" },
  { value: "WEBINAR", label: "Webinar" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "QA_SESSION", label: "Q&A Session" },
  { value: "MEETUP", label: "Meetup" },
  { value: "OTHER", label: "Other" },
]

export const CreateEventForm = ({ groupId, userId, onSuccess }: CreateEventFormProps) => {
  const { register, errors, onCreateEvent, isPending, setValue, watch } = useCreateEvent(groupId, userId, onSuccess)

  return (
    <form onSubmit={onCreateEvent} className="flex flex-col gap-y-5">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-white">
          Event Title *
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter event title..."
          className="bg-themeBlack/60 border-themeGray/60 focus:border-emerald-500/60 rounded-lg h-11 text-white placeholder:text-themeTextGray/60"
          {...register("title")}
        />
        <ErrorMessage
          errors={errors}
          name="title"
          render={({ message }) => <p className="text-red-400 text-sm">{message}</p>}
        />
      </div>

      {/* Event Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-white flex items-center gap-2">
          <Video className="w-4 h-4 text-emerald-400" />
          Event Type *
        </Label>
        <Select onValueChange={(value) => setValue("eventType", value as any)} defaultValue="LIVE_CLASS">
          <SelectTrigger className="bg-themeBlack/60 border-themeGray/60 h-11 text-white">
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1d] border-themeGray">
            {EVENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-white hover:bg-themeGray">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-white">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your event..."
          className="bg-themeBlack/60 border-themeGray/60 focus:border-emerald-500/60 rounded-lg text-white placeholder:text-themeTextGray/60 min-h-[80px] resize-none"
          {...register("description")}
        />
      </div>

      {/* Date and Time Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Start Date *
          </Label>
          <Input
            id="startDate"
            type="date"
            className="bg-themeBlack/60 border-themeGray/60 focus:border-emerald-500/60 rounded-lg h-11 text-white"
            {...register("startDate")}
          />
          <ErrorMessage
            errors={errors}
            name="startDate"
            render={({ message }) => <p className="text-red-400 text-sm">{message}</p>}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime" className="text-sm font-medium text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Start Time *
          </Label>
          <Input
            id="startTime"
            type="time"
            className="bg-themeBlack/60 border-themeGray/60 focus:border-emerald-500/60 rounded-lg h-11 text-white"
            {...register("startTime")}
          />
          <ErrorMessage
            errors={errors}
            name="startTime"
            render={({ message }) => <p className="text-red-400 text-sm">{message}</p>}
          />
        </div>
      </div>

      {/* End Date and Time Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-medium text-white">
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            className="bg-themeBlack/60 border-themeGray/60 focus:border-emerald-500/60 rounded-lg h-11 text-white"
            {...register("endDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime" className="text-sm font-medium text-white">
            End Time
          </Label>
          <Input
            id="endTime"
            type="time"
            className="bg-themeBlack/60 border-themeGray/60 focus:border-emerald-500/60 rounded-lg h-11 text-white"
            {...register("endTime")}
          />
        </div>
      </div>

      {/* Meeting URL */}
      <div className="space-y-2">
        <Label htmlFor="meetingUrl" className="text-sm font-medium text-white flex items-center gap-2">
          <Link2 className="w-4 h-4 text-emerald-400" />
          Meeting URL
        </Label>
        <Input
          id="meetingUrl"
          type="url"
          placeholder="https://zoom.us/j/..."
          className="bg-themeBlack/60 border-themeGray/60 focus:border-emerald-500/60 rounded-lg h-11 text-white placeholder:text-themeTextGray/60"
          {...register("meetingUrl")}
        />
        <ErrorMessage
          errors={errors}
          name="meetingUrl"
          render={({ message }) => <p className="text-red-400 text-sm">{message}</p>}
        />
      </div>

      {/* Location and Max Attendees Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Location
          </Label>
          <Input
            id="location"
            type="text"
            placeholder="Online or venue..."
            className="bg-themeBlack/60 border-themeGray/60 focus:border-emerald-500/60 rounded-lg h-11 text-white placeholder:text-themeTextGray/60"
            {...register("location")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxAttendees" className="text-sm font-medium text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Max Attendees
          </Label>
          <Input
            id="maxAttendees"
            type="number"
            placeholder="Unlimited"
            className="bg-themeBlack/60 border-themeGray/60 focus:border-emerald-500/60 rounded-lg h-11 text-white placeholder:text-themeTextGray/60"
            {...register("maxAttendees")}
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all mt-2"
      >
        <Loader loading={isPending}>Create Event</Loader>
      </Button>
    </form>
  )
}
