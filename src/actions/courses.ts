"use server"

import { client } from "@/lib/prisma"

export const onCreateGroupCourse = async (
  groupid: string,
  name: string,
  image: string,
  description: string,
  courseid: string,
  privacy: string,
  published: boolean,
) => {
  try {
    const course = await client.group.update({
      where: {
        id: groupid,
      },
      data: {
        courses: {
          create: {
            id: courseid,
            name,
            thumbnail: image,
            description,
            privacy,
            published,
          },
        },
      },
    })

    if (course) {
      return { status: 200, message: "Course successfully created" }
    }

    return { status: 404, message: "Group not found" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onDeleteSection = async (sectionId: string) => {
  try {
    const deleted = await client.section.delete({
      where: { id: sectionId },
    })
    if (deleted) return { status: 200, message: "Section deleted" }
    return { status: 404, message: "Section not found" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onDeleteModule = async (moduleId: string) => {
  try {
    const deleted = await client.module.delete({
      where: { id: moduleId },
    })
    // Section rows are set to cascade on module deletion in Prisma schema
    if (deleted) return { status: 200, message: "Module deleted" }
    return { status: 404, message: "Module not found" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

// Persist module ordering within a course
export const onReorderModules = async (
  courseId: string,
  orderedIds: string[],
) => {
  try {
    await client.$transaction(
      orderedIds.map((id, index) =>
        client.module.update({ where: { id }, data: { order: index } }),
      ),
    )
    return { status: 200, message: "Modules reordered" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

// Persist section ordering within a module
export const onReorderSections = async (
  moduleId: string,
  orderedIds: string[],
) => {
  try {
    await client.$transaction(
      orderedIds.map((id, index) =>
        client.section.update({ where: { id }, data: { order: index } }),
      ),
    )
    return { status: 200, message: "Sections reordered" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetGroupCourses = async (groupid: string) => {
  try {
    const courses = await client.course.findMany({
      where: {
        groupId: groupid,
      },
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    })

    if (courses && courses.length > 0) {
      return { status: 200, courses }
    }

    return {
      status: 404,
      message: "No courses found",
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onGetCourseModules = async (courseId: string) => {
  try {
    const modules = await client.module.findMany({
      where: {
        courseId,
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        section: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    })

    if (modules && modules.length > 0) {
      return { status: 200, modules }
    }

    return {
      status: 404,
      message: "No modules found",
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onCreateCourseModule = async (
  courseId: string,
  name: string,
  moduleId: string,
) => {
  try {
    const count = await client.module.count({ where: { courseId } })
    const courseModule = await client.course.update({
      where: {
        id: courseId,
      },
      data: {
        modules: {
          create: {
            title: name,
            id: moduleId,
            order: count,
          },
        },
      },
    })

    if (courseModule) {
      return { status: 200, message: "Module successfully created" }
    }

    return {
      status: 404,
      message: "No modules found",
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onUpdateModule = async (
  moduleId: string,
  type: "NAME" | "DATA",
  content: string,
) => {
  try {
    if (type === "NAME") {
      const title = await client.module.update({
        where: {
          id: moduleId,
        },
        data: {
          title: content,
        },
      })
      if (title) {
        return { status: 200, message: "Module successfully updated" }
      }
      return { status: 404, message: "No modules found" }
    }
    // const module = await client.module.update({
    //     where: {
    //         id: moduleId,
    //     },
    //     data: {
    //         title: type === "NAME" ? content : undefined,
    //         description: type === "DATA" ? content : undefined,
    //     },
    // })
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onUpdateSection = async (
  sectionId: string,
  type: "NAME" | "COMPLETE" | "ICON",
  content: string,
) => {
  try {
    if (type === "NAME") {
      const title = await client.section.update({
        where: {
          id: sectionId,
        },
        data: {
          name: content,
        },
      })
      if (title) {
        return { status: 200, message: "Section successfully updated" }
      }
      return { status: 404, message: "No sections found" }
    }
    if (type === "ICON") {
      const updated = await client.section.update({
        where: {
          id: sectionId,
        },
        data: {
          icon: content,
        },
      })
      if (updated) {
        return { status: 200, message: "Section icon updated" }
      }
      return { status: 404, message: "No sections found" }
    }
    if (type === "COMPLETE") {
      const title = await client.section.update({
        where: {
          // TODO: Filter for the specifc user as well
          id: sectionId,
        },
        data: {
          complete: true,
        },
      })
      if (title) {
        return { status: 200, message: "Section successfully updated" }
      }
      return { status: 404, message: "No sections found" }
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onCreateModuleSection = async (
  moduleid: string,
  sectionid: string,
  name?: string,
  icon?: string,
) => {
  try {
    const count = await client.section.count({ where: { moduleId: moduleid } })
    const section = await client.module.update({
      where: {
        id: moduleid,
      },
      data: {
        section: {
          create: {
            id: sectionid,
            ...(name ? { name } : {}),
            ...(icon ? { icon } : {}),
            order: count,
          },
        },
      },
    })
    if (section) {
      return { status: 200, message: "New section created" }
    }
    return { status: 404, message: "No sections found" }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onGetSectionInfo = async (sectionid: string) => {
  try {
    const section = await client.section.findUnique({
      where: {
        id: sectionid,
      },
    })
    if (section) {
      return { status: 200, section }
    }
    return { status: 404, message: "No sections found" }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onUpdateCourseSectionContent = async (
  sectionid: string,
  html: string,
  json: string,
  content: string,
) => {
  try {
    const section = await client.section.update({
      where: {
        id: sectionid,
      },
      data: {
        htmlContent: html,
        jsonContent: json,
        content,
      },
    })
    if (section) {
      return { status: 200, message: "Section successfully updated" }
    }
    return { status: 404, message: "No sections found" }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}
