"use client"

import { GlobalAccordion } from "@/components/global/accordion"
import { IconRenderer } from "@/components/global/icon-renderer"
import { AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCourseModule } from "@/hooks/courses"
import { Check } from "@/icons"
import { cn } from "@/lib/utils"
import { Circle, Plus } from "lucide-react"
import Link from "next/link"
import { v4 } from "uuid"

type ModuleListProps = {
  courseId: string
  groupid: string
}

export const CourseModuleList = ({ courseId, groupid }: ModuleListProps) => {
  const {
    data,
    onEditModule,
    edit,
    triggerRef,
    inputRef,
    variables,
    pathname,
    isPending,
    groupOwner,
    sectionVariables,
    pendingSection,
    mutateSection,
    setActiveSection,
    activeSection,
    contentRef,
    onEditSection,
    editSection,
    sectionInputRef,
    sectionUpdatePending,
    updateVariables,
  } = useCourseModule(courseId, groupid)

  const selectedSectionId = pathname.split("/").pop()

  return (
    <div className="flex flex-col">
      {data?.status === 200 &&
        data.modules?.map((module, idx) => {
          const total = module.section.length
          const completed = module.section.filter((s) => s.complete).length
          const moduleDone = total > 0 && completed === total

          return (
            <div key={module.id}>
              <GlobalAccordion
                edit={edit}
                ref={triggerRef}
                editable={<Input ref={inputRef} className="bg-themeBlack border-themeGray" />}
                onEdit={() => onEditModule(module.id)}
                id={module.id}
                title={
                  <div className="flex w-full items-center gap-3">
                    {moduleDone ? (
                      <Check/>
                    ) : (
                      <Circle/>
                    )}
                    <span className="text-[15px] md:text-base font-semibold">
                      {isPending ? variables?.content! : module.title}
                    </span>
                    <span className="ml-auto text-xs md:text-sm text-themeTextGray">
                      {completed}/{total}
                    </span>
                  </div>
                }
                itemClassName="rounded-xl bg-[#0C0C10]/80"
                triggerClassName="px-3 py-2 text-[15px] md:text-base font-semibold text-themeTextGray hover:text-white data-[state=open]:text-white"
              >
                <AccordionContent className="flex flex-col gap-y-2 px-3 py-2">
                  {module.section.length ? (
                    module.section.map((section) => {
                      const isSelected = selectedSectionId === section.id
                      return (
                        <Link
                          ref={contentRef}
                          key={section.id}
                          href={`/group/${groupid}/courses/${courseId}/${section.id}`}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors border text-[15px] md:text-base",
                            isSelected
                              ? "bg-[#0B0B10] text-white border-[#3A3A41] ring-1 ring-[#4F46E5]/30"
                              : "text-themeTextGray hover:bg-themeGray/60 border-transparent",
                          )}
                          onClick={() => setActiveSection(section.id)}
                          onDoubleClick={onEditSection}
                        >
                          {section.complete ? (
                            <Check/>
                          ) : (
                            <Circle/>
                          )}
                          <IconRenderer icon={section.icon} mode={isSelected ? "LIGHT" : "DARK"} />
                          {editSection && activeSection === section.id ? (
                            <Input ref={sectionInputRef} className="flex-1 bg-transparent border-none p-0" />
                          ) : sectionUpdatePending && activeSection === section.id ? (
                            updateVariables?.content
                          ) : (
                            <span className="truncate text-[15px] md:text-base">{section.name}</span>
                          )}
                        </Link>
                      )
                    })
                  ) : (
                    <></>
                  )}
                  {groupOwner?.groupOwner && (
                    <>
                      {pendingSection && sectionVariables && (
                        <Link
                          onClick={() => setActiveSection(sectionVariables.sectionid)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors border text-[15px] md:text-base",
                            selectedSectionId === sectionVariables.sectionid
                              ? "bg-[#0B0B10] text-white border-[#3A3A41] ring-1 ring-[#4F46E5]/30"
                              : "text-themeTextGray hover:bg-themeGray/60 border-dashed border-[#2F2F36]",
                          )}
                          href={`/group/${groupid}/courses/${courseId}/${sectionVariables.sectionid}`}
                        >
                          <Circle className="text-themeTextGray" />
                          <IconRenderer icon={"doc"} mode={selectedSectionId === sectionVariables.sectionid ? "LIGHT" : "DARK"} />
                          <span className="truncate text-[15px] md:text-base">New Section</span>
                        </Link>
                      )}
                      <Button
                        onClick={() =>
                          mutateSection({
                            moduleid: module.id,
                            sectionid: v4(),
                          })
                        }
                        className="mt-2 w-full justify-center rounded-lg border-2 border-dashed border-[#2F2F36] bg-transparent text-themeTextGray hover:border-[#3A3A41] hover:bg-[#0F0F14]"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="ml-2">Add Section</span>
                      </Button>
                    </>
                  )}
                </AccordionContent>
              </GlobalAccordion>
              {idx < (data.modules?.length ?? 0) - 1 && (
                <Separator className="my-3 bg-[#2A2A33]/60" />
              )}
            </div>
          )
        })}
    </div>
  )
}
