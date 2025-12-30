type CreditCardProps = {
  className?: string
}

export const CreditCard = ({ className }: CreditCardProps) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M2 10H22"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M6 15H12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
