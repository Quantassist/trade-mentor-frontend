"use client"

import { GlobalAccordion } from "@/components/global/accordion"
import { IconRenderer } from "@/components/global/icon-renderer"
import { AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCourseModule } from "@/hooks/courses"
import { Check } from "@/icons"
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

  return (
    <div className="flex flex-col">
      {data?.status === 200 &&
        data.modules?.map((module) => (
          <GlobalAccordion
            edit={edit}
            ref={triggerRef}
            editable={
              <Input
                ref={inputRef}
                className="bg-themeBlack border-themeGray"
              />
            }
            onEdit={() => onEditModule(module.id)}
            id={module.id}
            key={module.id}
            title={isPending ? variables?.content! : module.title}
          >
            <AccordionContent className="flex flex-col gap-y-2 px-3">
              {module.section.length ? (
                module.section.map((section) => (
                  <Link
                    ref={contentRef}
                    key={section.id}
                    href={`/group/${groupid}/courses/${courseId}/${section.id}`}
                    className="flex gap-x-3 items-center capitalize"
                    onClick={() => setActiveSection(section.id)}
                    onDoubleClick={onEditSection}
                  >
                    {/* {section.complete ? <PurpleCheck /> : <EmptyCircle />} */}
                    {section.complete ? <Check /> : <Circle />}{" "}
                    {/* // TODO: Replace with PurpleCheck icons */}
                    <IconRenderer
                      icon={section.icon}
                      mode={
                        pathname.split("/").pop() === section.id
                          ? "LIGHT"
                          : "DARK"
                      }
                    />
                    {editSection && activeSection === section.id ? (
                      <Input
                        ref={sectionInputRef}
                        className="flex-1 bg-transparent border-none p-0"
                      />
                    ) : sectionUpdatePending && activeSection === section.id ? (
                      updateVariables?.content
                    ) : (
                      section.name
                    )}
                  </Link>
                ))
              ) : (
                <></>
              )}
              {groupOwner?.groupOwner && (
                <>
                  {pendingSection && sectionVariables && (
                    <Link
                      onClick={() =>
                        setActiveSection(sectionVariables.sectionid)
                      }
                      className="flex gap-x-3 items-center"
                      href={`/group/${groupid}/courses/${courseId}/${sectionVariables.sectionid}`}
                    >
                      <Circle />
                      <IconRenderer
                        icon={"doc"}
                        mode={
                          pathname.split("/").pop() ===
                          sectionVariables.sectionid
                            ? "LIGHT"
                            : "DARK"
                        }
                      />
                      New Section
                    </Link>
                  )}
                  <Button
                    onClick={() =>
                      mutateSection({
                        moduleid: module.id,
                        sectionid: v4(),
                      })
                    }
                    className="bg-transparent border-themeGray text-themeTextGray mt-2"
                    variant="outline"
                  >
                    <Plus />
                  </Button>
                </>
              )}
            </AccordionContent>
          </GlobalAccordion>
        ))}
    </div>
  )
}
