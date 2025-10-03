export type AuthFormProps = {
  id: string
  type: "email" | "text" | "password"
  inputType: "select" | "input"
  options?: { value: string; label: string; id: string }[]
  label?: string
  placeholder: string
  name: string
}
export const SIGN_UP_FORM: AuthFormProps[] = [
  {
    id: "1",
    inputType: "input",
    placeholder: "John",
    name: "firstname",
    type: "text",
    label: "First name",
  },
  {
    id: "2",
    inputType: "input",
    placeholder: "Doe",
    name: "lastname",
    type: "text",
    label: "Last name",
  },
  {
    id: "3",
    inputType: "input",
    placeholder: "john@example.com",
    name: "email",
    type: "email",
    label: "Email",
  },
  {
    id: "4",
    inputType: "input",
    placeholder: "Create a strong password",
    name: "password",
    type: "password",
    label: "Password",
  },
]

export const SIGN_IN_FORM: AuthFormProps[] = [
  {
    id: "1",
    inputType: "input",
    placeholder: "Email",
    name: "email",
    type: "email",
    label: "Email",
  },
  {
    id: "4",
    inputType: "input",
    placeholder: "Password",
    name: "password",
    type: "password",
    label: "Password",
  },
]
