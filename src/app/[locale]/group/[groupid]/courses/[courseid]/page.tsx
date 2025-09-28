type CoursePageProprs = {
  params: Promise<{ courseid: string }>
}

const CoursePage = async ({ params }: CoursePageProprs) => {
  const { courseid } = await params
  return <div></div>
}

export default CoursePage
