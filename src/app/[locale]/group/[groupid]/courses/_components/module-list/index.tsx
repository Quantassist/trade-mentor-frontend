"use client"

import { SectionCreateForm, SectionEditForm } from "@/components/form/create-section"
import { GlobalAccordion } from "@/components/global/accordion"
import { GlassSheet } from "@/components/global/glass-sheet"
import { IconRenderer } from "@/components/global/icon-renderer"
import { ReorderableList } from "@/components/global/reorderable-list"
import { AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SECTION_TYPES } from "@/constants/icons"
import { useCourseModule } from "@/hooks/courses"
import { Link } from "@/i18n/navigation"
import { Check } from "@/icons"
import { cn } from "@/lib/utils"
import { Circle, GripVertical, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

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
    updateSection,
    updateSectionById,
    deleteSection,
    deleteModule,
    reorderModules,
    reorderSections,
  } = useCourseModule(courseId, groupid)

  const tr = useTranslations("sectionTypes")
  const locale = useLocale()
  const selectedSectionId = pathname.split("/").pop()

  // Local state for optimistic ordering
  const [modulesLocal, setModulesLocal] = useState<any[]>([])
  useEffect(() => {
    if (data?.status === 200) {
      setModulesLocal(data.modules || [])
    }
  }, [data])

  const canManage = Boolean(groupOwner?.isSuperAdmin || groupOwner?.groupOwner || groupOwner?.role === "ADMIN")

  return (
    <div className="flex flex-col">
      {modulesLocal && modulesLocal.length > 0 && (
        <ReorderableList
          droppableId={`modules-${courseId}`}
          items={modulesLocal}
          getId={(m: any) => m.id}
          disabled={!canManage}
          onReorder={(newItems, orderedIds) => {
            setModulesLocal(newItems)
            reorderModules(orderedIds)
          }}
          renderItem={(module: any, idx: number, handleProps) => {
            const total = module.section.length
            const completed = module.section.filter((s: any) => s.complete).length
            const moduleDone = total > 0 && completed === total
            return (
              <div key={module.id}>
                <GlobalAccordion
                  edit={edit}
                  ref={triggerRef}
                  editable={<Input ref={inputRef} className="bg-themeBlack border-themeGray" />}
                  onEdit={canManage ? () => onEditModule(module.id) : undefined}
                  id={module.id}
                  defaultOpen={Array.isArray(module.section) && module.section.some((s: any) => s.id === selectedSectionId)}
                  title={
                    <div className="flex w-full items-center gap-3">
                      {handleProps && (
                        <span {...handleProps} className="cursor-grab text-themeTextGray hover:text-white">
                          <GripVertical className="h-4 w-4" />
                        </span>
                      )}
                      {moduleDone ? <Check /> : <Circle />}
                      <span className="text-[15px] md:text-base font-semibold">
                        {isPending ? variables?.content! : module.title}
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs md:text-sm text-themeTextGray">
                          {completed}/{total}
                        </span>
                        {canManage && (
                          <Button
                            asChild
                            type="button"
                            aria-label="Delete module"
                            variant="ghost"
                            size="icon"
                            className="text-themeTextGray hover:text-red-400"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm("Delete this module and all its sections?")) {
                                deleteModule(module.id)
                              }
                            }}
                          >
                            <span role="button">
                              <Trash2 className="h-4 w-4" />
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  }
                  itemClassName="rounded-xl overflow-hidden border border-themeGray/60 bg-[#161a20]"
                  triggerClassName="px-3 py-2 text-[15px] md:text-base font-semibold text-themeTextGray hover:text-white data-[state=open]:text-white"
                >
                  <AccordionContent className="px-0 py-0">
                    <div className="border-t border-themeGray/60 bg-white/5">
                      <div className="flex flex-col gap-y-2 px-3 py-2">
                        {module.section.length ? (
                          <ReorderableList
                            droppableId={`sections-${module.id}`}
                            items={module.section}
                            getId={(s: any) => s.id}
                            disabled={!canManage}
                            onReorder={(newSections, orderedIds) => {
                              setModulesLocal((prev) =>
                                prev.map((m) => (m.id === module.id ? { ...m, section: newSections } : m)),
                              )
                              reorderSections({ moduleId: module.id, orderedIds })
                            }}
                            renderItem={(section: any, _sIdx: number, handleProps) => {
                              const isSelected = selectedSectionId === section.id
                              return (
                                <div
                                  key={section.id}
                                  className={cn(
                                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors border text-[15px] md:text-base",
                                    isSelected
                                      ? "bg-[#0B0B10] text-white border-[#3A3A41] ring-1 ring-[#4F46E5]/30"
                                      : "text-themeTextGray hover:bg-white/5 border-transparent",
                                  )}
                                >
                                  {handleProps && (
                                    <span {...handleProps} className="cursor-grab text-themeTextGray hover:text-white">
                                      <GripVertical className="h-4 w-4" />
                                    </span>
                                  )}
                                  <Link
                                    ref={contentRef}
                                    href={`/group/${groupid}/courses/${courseId}/${section.id}`}
                                    className="min-w-0 flex flex-1 items-start gap-3"
                                    onClick={() => setActiveSection(section.id)}
                                    onDoubleClick={canManage ? onEditSection : undefined}
                                  >
                                    {section.complete ? <Check /> : <Circle />}
                                    {/* <IconRenderer icon={section.icon} mode={isSelected ? "LIGHT" : "DARK"} /> */}
                                    <div className="flex min-w-0 flex-col">
                                      {editSection && activeSection === section.id ? (
                                        <Input
                                          ref={sectionInputRef}
                                          className="flex-1 bg-transparent border-none p-0"
                                        />
                                      ) : sectionUpdatePending && activeSection === section.id ? (
                                        updateVariables?.content
                                      ) : (
                                        <span className="block whitespace-normal break-words leading-snug text-[15px] md:text-base">{section.name}</span>
                                      )}
                                      <div className="mt-0.5 flex items-center gap-2 text-[11px] md:text-xs text-themeTextGray">
                                        <span className="px-1.5 py-0.5 rounded border border-themeGray/60 bg-white/5 text-[10px] uppercase tracking-wide text-themeTextGray">
                                          {SECTION_TYPES.find((t) => t.id === (section.type || "concept"))?.label || section.type || "Concept"}
                                        </span>
                                      </div>
                                    </div>
                                  </Link>
                                  {canManage && (
                                    <div className="absolute right-2 top-1.5 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity">
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-themeTextGray hover:text-white">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-40 p-1 bg-[#161a20] border-themeGray/60">
                                          <GlassSheet
                                            trigger={
                                              <Button type="button" variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm text-themeTextWhite hover:bg-white/5">
                                                Edit
                                              </Button>
                                            }
                                            triggerClass=""
                                            className="w-[380px] sm:w-[420px]"
                                          >
                                            <h3 className="mb-4 text-lg font-semibold">Edit Section</h3>
                                            <SectionEditForm
                                              groupid={groupid}
                                              sectionid={section.id}
                                              initialName={section.name}
                                              initialIcon={section.icon}
                                            />
                                          </GlassSheet>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full justify-start px-2 py-1.5 text-sm text-red-300 hover:bg-white/5"
                                            onClick={() => {
                                              if (confirm("Delete this section?")) {
                                                deleteSection(section.id)
                                              }
                                            }}
                                          >
                                            Delete
                                          </Button>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  )}
                                </div>
                              )
                            }}
                          />
                        ) : (
                          <></>
                        )}
                        {canManage && (
                          <>
                            {pendingSection && sectionVariables && (
                              <Link
                                onClick={() => setActiveSection(sectionVariables.sectionid)}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors border text-[15px] md:text-base",
                                  selectedSectionId === sectionVariables.sectionid
                                    ? "bg-[#0B0B10] text-white border-[#3A3A41] ring-1 ring-[#4F46E5]/30"
                                    : "text-themeTextGray hover:bg-white/5 border-dashed border-[#2F2F36]",
                                )}
                                href={`/group/${groupid}/courses/${courseId}/${sectionVariables.sectionid}`}
                              >
                                <Circle className="text-themeTextGray" />
                                <IconRenderer icon={"doc"} mode={selectedSectionId === sectionVariables.sectionid ? "LIGHT" : "DARK"} />
                                <span className="truncate text-[15px] md:text-base">New Section</span>
                              </Link>
                            )}
                            <GlassSheet
                              trigger={
                                <Button
                                  className="mt-2 w-full justify-center rounded-lg border-2 border-dashed border-[#2F2F36] bg-transparent text-themeTextGray hover:border-[#3A3A41] hover:bg-[#0F0F14]"
                                  variant="outline"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span className="ml-2">Add Section</span>
                                </Button>
                              }
                              className="w-[380px] sm:w-[420px]"
                            >
                              <h3 className="mb-4 text-lg font-semibold">Create Section</h3>
                              <SectionCreateForm moduleid={module.id} groupid={groupid} />
                            </GlassSheet>
                          </>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </GlobalAccordion>
                {idx < (modulesLocal?.length ?? 0) - 1 && (
                  <Separator className="my-3 bg-[#2A2A33]/60" />
                )}
              </div>
            )
          }}
        />
      )}
    </div>
  )
}
