import { onAuthenticatedUser } from "@/actions/auth"
import { useEffect, useState } from "react"

export const useAuthenticatedUser = () => {
  const [user, setUser] = useState<{
    status: number
    id?: string
    username?: string
    image?: string | null
  }>({
    status: 0,
    id: undefined,
    username: undefined,
    image: undefined,
  })

  useEffect(() => {
    onAuthenticatedUser().then((resolvedUser) => {
      setUser(resolvedUser)
    })
  }, [])

  return user
}
