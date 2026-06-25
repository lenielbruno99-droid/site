interface LogoProps {
  small?: boolean;
}

export default function Logo({ small = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        className={small ? 'w-9 h-9' : 'w-12 h-12'}
      >
        <path
          d="M50 38C50 38 35 5 18 8C8 10 8 28 22 35C32 40 45 40 50 45"
          stroke="url(#g1)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M50 38C50 38 65 5 82 8C92 10 92 28 78 35C68 40 55 40 50 45"
          stroke="url(#g1)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M50 48C50 48 38 58 25 58C15 58 13 70 22 76C30 81 42 78 47 68"
          stroke="url(#g1)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M50 48C50 48 62 58 75 58C85 58 87 70 78 76C70 81 58 78 53 68"
          stroke="url(#g1)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <ellipse cx="50" cy="55" rx="3.2" ry="18" fill="url(#g1)" />
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#9C7B2E" />
            <stop offset="50%" stopColor="#E8C77E" />
            <stop offset="100%" stopColor="#9C7B2E" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <div
          className={`font-['Cormorant_Garamond'] ${
            small ? 'text-[20px]' : 'text-[23px]'
          } leading-none text-[#926f24]`}
        >
          Daiane Moreira
        </div>
        <div className="text-[11.5px] text-[#7a6d5b] -mt-[1px]">
          Brows & Lips Studio
        </div>
      </div>
    </div>
  );
}
