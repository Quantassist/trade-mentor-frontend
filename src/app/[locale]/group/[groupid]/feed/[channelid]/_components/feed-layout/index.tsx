"use client"

type FeedLayoutProps = {
  children: React.ReactNode
  sidebar: React.ReactNode
}

export const FeedLayout = ({ children, sidebar }: FeedLayoutProps) => {
  return (
    <div className="flex justify-center w-full">
      {/* Center - Posts Feed */}
      <div className="flex-1 max-w-[600px] border-x border-themeGray/30">
        <div className="flex flex-col gap-y-4 py-4 px-3">
          {children}
        </div>
      </div>

      {/* Right Sidebar - simple sticky at top, scrolls naturally with page */}
      <div className="hidden lg:block w-[350px] shrink-0 pt-4 pl-4 pr-2">
        <div className="sticky top-4">
          <div className="flex flex-col gap-4">
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  )
}
