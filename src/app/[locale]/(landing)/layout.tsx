import { LandingPageNavbar } from "./_components/navbar"

const LandingPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col container relative mx-auto">
      <LandingPageNavbar />
      {children}
    </div>
  )
}

export default LandingPageLayout
