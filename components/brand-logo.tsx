import Image from "next/image";

const PRESETS = { sm: 36, md: 48, lg: 72, xl: 96 } as const;

export function BrandLogo({
  size = "md",
  className = "",
  priority = false,
}: {
  size?: keyof typeof PRESETS | number;
  className?: string;
  priority?: boolean;
}) {
  const px = typeof size === "number" ? size : PRESETS[size];
  return (
    <Image
      src="/agri-setu-logo.png"
      alt="Agri Setu"
      width={px}
      height={px}
      className={`shrink-0 object-contain ${className}`}
      priority={priority}
    />
  );
}
