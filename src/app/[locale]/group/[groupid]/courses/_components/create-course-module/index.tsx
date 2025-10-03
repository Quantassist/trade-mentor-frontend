"use client"

import { GlobalAccordion } from "@/components/global/accordion"
import { Button } from "@/components/ui/button"
import { useCreateModule } from "@/hooks/courses"
import { Plus } from "lucide-react"

type CreateCourseModuleProps = {
  courseid: string
  groupid: string
}

export const CreateCourseModule = ({
  courseid,
  groupid,
}: CreateCourseModuleProps) => {
  const { variables, isPending, onCreateModule, data } = useCreateModule(
    courseid,
    groupid,
  )
  const canManage = !!(data?.isSuperAdmin || data?.groupOwner || data?.role === "ADMIN")
  if (!canManage) return <></>

  return (
    <div className="flex flex-col gap-y-3">
      <Button
        onClick={() => onCreateModule()}
        variant="outline"
        className="w-full justify-center rounded-lg border-2 border-dashed border-[#2F2F36] bg-transparent text-themeTextGray hover:border-[#3A3A41] hover:bg-[#0F0F14]"
      >
        <Plus className="h-4 w-4" />
        <span className="ml-2">Add New Module</span>
      </Button>

      {variables && isPending && (
        <GlobalAccordion
          id={variables.moduleId}
          title={variables.title}
          itemClassName="rounded-xl border border-[#2A2A33] bg-[#0C0C10]/80"
          triggerClassName="px-3 py-2 text-sm font-semibold text-themeTextGray"
        >
          <Button
            variant="outline"
            className="mt-2 w-full justify-center rounded-lg border-2 border-dashed border-[#2F2F36] bg-transparent text-themeTextGray hover:border-[#3A3A41] hover:bg-[#0F0F14]"
          >
            <Plus className="h-4 w-4" />
            <span className="ml-2">Add Section</span>
          </Button>
        </GlobalAccordion>
      )}
    </div>
  )
}
