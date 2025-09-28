import { Badge } from "@/components/ui/badge"
import { Person, Remove } from "@/icons"

interface SubscriptionCardProps {
  option: { value: string; price: number; members: number }
  selected: string
  onSelected: (value: string) => void
  handleRemove: (e: React.MouseEvent<HTMLDivElement>) => void
}

const SubscriptionCard = ({
  option,
  selected,
  onSelected,
  handleRemove,
}: SubscriptionCardProps) => {
  const isSelected = selected === option.value

  return (
    <label>
      <input
        type="radio"
        name="subscription"
        value={option.value}
        checked={isSelected}
        onChange={() => onSelected(option.value)}
        className="hidden"
      />
      <div
        className={`relative group rounded-xl h-40 border-2 bg-themeGray cursor-pointer hover:bg-themeBlack hover:text-accent-foreground px-10 py-7 flex flex-col items-center justify-evenly ${
          isSelected
            ? "border-[#5A328E]"
            : "border-themeGray hover:border-themeBlack"
        }`}
      >
        {option.members == 0 && (
          <div
            onClick={handleRemove}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Remove />
          </div>
        )}
        <div className="flex flex-col gap-3 items-center">
          <span className="text-2xl font-medium">{`$${option.price}/month`}</span>
          <span className="text-sm text-themeTextGray flex gap-1 items-center">
            <Person />
            {`${option.members} members`}
          </span>
        </div>
        {isSelected && (
          <Badge className="mt-4 bg-[#5A328E] text-white w-fit mx-auto hover:bg-[#5A328E]">
            Current Price
          </Badge>
        )}
      </div>
    </label>
  )
}

export default SubscriptionCard
