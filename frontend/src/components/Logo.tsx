interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo = ({ className = '', size = 40 }: LogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded square "dock" */}
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        rx="12"
        stroke="#F59E0B"
        strokeWidth="6"
        fill="none"
      />

      {/* Lightning bolt/spark */}
      <path
        d="M 50 35 L 45 50 L 52 50 L 48 65 L 58 48 L 51 48 Z"
        fill="#F59E0B"
      />
    </svg>
  );
};
