import { GradientText } from "@/components/global/gradient-text"
import { Button } from "@/components/ui/button"
import { BadgePlus } from "@/icons/badge-plus"
import Link from "next/link"

export const CallToAction = () => {
  return (
    <div className="flex flex-col items-start md:items-center gap-y-5 md:gap-y-0">
      <GradientText
        className="text-[35px] md:text-[55px] lg:text-[75px] xl:text-[70px] 2xl:text-[80px] leading-tight font-semibold"
        element="H1"
      >
        Financial education <br className="md:hidden" /> made easy
      </GradientText>
      <p className="text-sm md:text-center text-left text-muted-foreground">
        TradeFlix is a vibrant online financial education platform that empowers
        <br className="md:hidden" /> individuals to learn,{" "}
        <br className="hidden md:block" /> collaborate, and cultivate financial{" "}
        <br className="md:hidden" />
        literacy
      </p>
      <div className="flex md:flex-row flex-col md:justify-center gap-5 md:mt-5 w-full">
        <Button
          variant="outline"
          className="rounded-xl bg-transparent text-base"
        >
          Watch Demo
        </Button>
        <Link href="/sign-in">
          <Button className="rounded-xl text-base flex gap-2 w-full">
            <BadgePlus /> Get Started
          </Button>
        </Link>
      </div>
    </div>
  )
}
