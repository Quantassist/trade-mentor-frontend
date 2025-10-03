"use client"

import NewPostForm from "@/components/form/new-post-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"

const NewPost = (groupid: string) => {
  const { user } = useUser()
  const userDetails = {
    name: `${user?.firstName} ${user?.lastName}`,
    imageUrl: user?.imageUrl!,
    id: user?.id!,
  }

  const [open, setOpen] = useState(false)

  return (
    <div className="w-full">
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
        }}
      >
        <DialogTrigger className="w-full max-w-xl cursor-text">
          <div className="w-full flex gap-6 items-center py-2 px-4 bg-[#1C1C1E] rounded-2xl border border-[#27272A]">
            <Avatar className="cursor-pointer">
              <AvatarImage
                src={user?.imageUrl!}
                alt="user"
                className="h-11 w-11"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <p className="text-[#B4B0AE] text-sm">
              Type / to add elements to your post...
            </p>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-card rounded-xl p-4 w-full max-w-xl">
          <DialogHeader>
            <DialogDescription>
              <NewPostForm user={userDetails} setOpen={setOpen} groupid={groupid} />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NewPost
