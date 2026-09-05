// Custom 2D agricultural icon system — consistent stroke weight, rounded caps, geometric forms

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const defaults = { size: 24, color: "currentColor" };

export function IconLeaf({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 21C12 21 4 16 4 9C4 5.13 7.58 2 12 2C16.42 2 20 5.13 20 9C20 16 12 21 12 21Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.12"/>
      <path d="M12 21V10" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 14C10 12 8 11 8 9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconHome({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V10.5Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1"/>
    </svg>
  );
}

export function IconPlus({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.1"/>
      <path d="M12 8V16M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconBasket({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 7H18L17 18C16.9 18.6 16.4 19 15.8 19H8.2C7.6 19 7.1 18.6 7 18L6 7Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color} fillOpacity="0.1"/>
      <path d="M4 7H20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 5L12 2L15 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11V15M14 11V15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconUser({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.1"/>
      <path d="M4 20C4 17 7.58 15 12 15C16.42 15 20 17 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function IconStore({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="10" width="18" height="11" rx="1.5" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.1"/>
      <path d="M3 10L5 4H19L21 10" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M3 10H21" stroke={color} strokeWidth="1.8"/>
      <rect x="9" y="14" width="6" height="7" rx="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15"/>
    </svg>
  );
}

export function IconPayment({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="6" width="20" height="14" rx="2.5" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.08"/>
      <path d="M2 10H22" stroke={color} strokeWidth="1.8"/>
      <rect x="5" y="13" width="5" height="2.5" rx="1" fill={color} fillOpacity="0.5"/>
      <circle cx="18" cy="14" r="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15"/>
    </svg>
  );
}

export function IconLocation({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color} fillOpacity="0.12"/>
      <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="1.5" fill="white"/>
    </svg>
  );
}

export function IconCalendar({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.08"/>
      <path d="M3 10H21" stroke={color} strokeWidth="1.8"/>
      <path d="M8 3V7M16 3V7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="8" cy="15" r="1.2" fill={color}/>
      <circle cx="12" cy="15" r="1.2" fill={color}/>
      <circle cx="16" cy="15" r="1.2" fill={color}/>
    </svg>
  );
}

export function IconWeather({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="10" r="4" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.12"/>
      <path d="M12 3V1M12 19V17M21 10H19M5 10H3M18.36 3.64L16.95 5.05M7.05 14.95L5.64 16.36M18.36 16.36L16.95 14.95M7.05 5.05L5.64 3.64" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 18C5.34 18 4 16.66 4 15C4 13.48 5.09 12.22 6.52 12.03C7.05 10.27 8.67 9 10.6 9C12.97 9 14.9 10.93 14.9 13.3C14.9 13.37 14.9 13.43 14.89 13.5H15C16.38 13.5 17.5 14.62 17.5 16C17.5 17.38 16.38 18.5 15 18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconTrend({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 18L9 12L13 15L20 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 7H20V11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconCheck({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12L10 17L19 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronRight({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 6L15 12L9 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconArrowLeft({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Crop illustrations — simple 2D silhouettes
export function CropTomato({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="23" r="12" fill="#E85C4A" fillOpacity="0.9"/>
      <path d="M20 11C20 11 17 8 14 9C14 9 16 12 20 11Z" fill="#2E7D32"/>
      <path d="M20 11C20 11 23 8 26 9C26 9 24 12 20 11Z" fill="#2E7D32"/>
      <path d="M20 11V14" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 20C15 20 17 18 20 19" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

export function CropOnion({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <ellipse cx="20" cy="24" rx="11" ry="12" fill="#C9A0DC" fillOpacity="0.85"/>
      <path d="M12 22C11 16 15 10 20 10C25 10 29 16 28 22" stroke="#A070B5" strokeWidth="1.2"/>
      <path d="M20 10V6" stroke="#4CAF50" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 6C20 6 18 4 17 3" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="20" cy="28" rx="6" ry="3" fill="#B08AC0" fillOpacity="0.5"/>
    </svg>
  );
}

export function CropPotato({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <ellipse cx="20" cy="22" rx="13" ry="10" fill="#C4945A" fillOpacity="0.9" transform="rotate(-15 20 22)"/>
      <circle cx="15" cy="19" r="1.2" fill="#A0724A" fillOpacity="0.7"/>
      <circle cx="23" cy="25" r="1.2" fill="#A0724A" fillOpacity="0.7"/>
      <circle cx="19" cy="15" r="1" fill="#A0724A" fillOpacity="0.7"/>
    </svg>
  );
}

export function CropRice({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <path d="M20 32V10" stroke="#8BC34A" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="17" cy="14" rx="3.5" ry="2" fill="#C8E6C9" transform="rotate(-30 17 14)"/>
      <ellipse cx="23" cy="17" rx="3.5" ry="2" fill="#C8E6C9" transform="rotate(30 23 17)"/>
      <ellipse cx="17" cy="20" rx="3.5" ry="2" fill="#C8E6C9" transform="rotate(-30 17 20)"/>
      <ellipse cx="23" cy="23" rx="3.5" ry="2" fill="#C8E6C9" transform="rotate(30 23 23)"/>
    </svg>
  );
}

export function CropWheat({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <path d="M20 34V8" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="16" cy="12" rx="3" ry="1.5" fill="#F0C040" transform="rotate(-40 16 12)"/>
      <ellipse cx="24" cy="12" rx="3" ry="1.5" fill="#F0C040" transform="rotate(40 24 12)"/>
      <ellipse cx="15" cy="17" rx="3" ry="1.5" fill="#F0C040" transform="rotate(-40 15 17)"/>
      <ellipse cx="25" cy="17" rx="3" ry="1.5" fill="#F0C040" transform="rotate(40 25 17)"/>
      <ellipse cx="14" cy="22" rx="3" ry="1.5" fill="#F0C040" transform="rotate(-40 14 22)"/>
      <ellipse cx="26" cy="22" rx="3" ry="1.5" fill="#F0C040" transform="rotate(40 26 22)"/>
    </svg>
  );
}

export function CropChilli({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <path d="M22 10C26 12 29 18 26 28C25 31 22 32 20 30C18 28 18 24 20 20C21 17 20 14 17 12" stroke="#E53935" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M22 10C22 10 24 8 23 6" stroke="#4CAF50" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M22 10C22 10 25 9 26 7" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function CropBrinjal({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <ellipse cx="20" cy="24" rx="9" ry="12" fill="#6A1B9A" fillOpacity="0.85"/>
      <path d="M20 12C20 12 17 9 18 7C19 5 21 5 22 7C23 9 20 12 20 12Z" fill="#4CAF50"/>
      <path d="M14 22C14 22 16 19 20 20" stroke="#7B1FA2" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

export function CropOther({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="12" stroke="#1B7A3D" strokeWidth="1.8" strokeDasharray="3 2" fill="#E8F5EE"/>
      <path d="M14 20H26M20 14V26" stroke="#1B7A3D" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// Illustration: Farmer → Produce → Store → Payment chain
export function IllustrationFlow({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  const label = tone === "onDark" ? "rgba(255,255,255,0.88)" : "#5A7263";
  const arrow = tone === "onDark" ? "rgba(255,255,255,0.4)" : "#DDE8E1";
  return (
    <svg viewBox="0 0 320 120" fill="none" className={className}>
      {/* Farmer */}
      <circle cx="32" cy="44" r="12" fill="#E8F5EE" stroke="#1B7A3D" strokeWidth="1.5"/>
      <circle cx="32" cy="38" r="5" fill="#1B7A3D" fillOpacity="0.8"/>
      <path d="M22 56C22 50 27 47 32 47C37 47 42 50 42 56" stroke="#1B7A3D" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="32" y="70" textAnchor="middle" fontSize="8" fill={label} fontFamily="Poppins, sans-serif">Farmer</text>

      {/* Arrow */}
      <path d="M52 50H76" stroke={arrow} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2"/>
      <path d="M72 46L78 50L72 54" stroke="#1B7A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Crate */}
      <rect x="88" y="36" width="24" height="20" rx="3" fill="#FEF3E0" stroke="#E9A23B" strokeWidth="1.5"/>
      <path d="M88 44H112" stroke="#E9A23B" strokeWidth="1.2"/>
      <path d="M100 36V56" stroke="#E9A23B" strokeWidth="1.2"/>
      <text x="100" y="70" textAnchor="middle" fontSize="8" fill={label} fontFamily="Poppins, sans-serif">Produce</text>

      {/* Arrow */}
      <path d="M120 50H144" stroke={arrow} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2"/>
      <path d="M140 46L146 50L140 54" stroke="#1B7A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Store */}
      <rect x="156" y="38" width="24" height="16" rx="2" fill="#E8F5EE" stroke="#1B7A3D" strokeWidth="1.5"/>
      <path d="M156 44H180" stroke="#1B7A3D" strokeWidth="1.2"/>
      <rect x="162" y="44" width="6" height="10" rx="1" fill="#1B7A3D" fillOpacity="0.25"/>
      <path d="M152 42L156 38H180L184 42" stroke="#1B7A3D" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="168" y="70" textAnchor="middle" fontSize="8" fill={label} fontFamily="Poppins, sans-serif">White Store</text>

      {/* Arrow */}
      <path d="M188 50H212" stroke={arrow} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2"/>
      <path d="M208 46L214 50L208 54" stroke="#1B7A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Payment */}
      <rect x="224" y="37" width="24" height="16" rx="3" fill="#E8F5EE" stroke="#1B7A3D" strokeWidth="1.5"/>
      <path d="M224 43H248" stroke="#1B7A3D" strokeWidth="1.2"/>
      <rect x="228" y="46" width="6" height="3" rx="1" fill="#1B7A3D" fillOpacity="0.4"/>
      <circle cx="243" cy="47" r="2.5" stroke="#E9A23B" strokeWidth="1.2"/>
      <text x="236" y="70" textAnchor="middle" fontSize="8" fill={label} fontFamily="Poppins, sans-serif">Payment</text>

      {/* Instant badge */}
      <rect x="252" y="80" width="60" height="18" rx="9" fill="#E9A23B" fillOpacity={tone === "onDark" ? 0.9 : 0.2}/>
      <text x="282" y="92" textAnchor="middle" fontSize="7.5" fill={tone === "onDark" ? "#1A2E1E" : "#8A6020"} fontFamily="Poppins, sans-serif" fontWeight="600">Instant Pay ✓</text>
    </svg>
  );
}

// Produce crate illustration
export function IllustrationCrate({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="8" y="28" width="48" height="28" rx="4" fill="#FEF3E0" stroke="#E9A23B" strokeWidth="1.8"/>
      <path d="M8 36H56" stroke="#E9A23B" strokeWidth="1.5"/>
      <path d="M24 28V56M40 28V56" stroke="#E9A23B" strokeWidth="1.5"/>
      <rect x="12" y="22" width="40" height="8" rx="3" fill="#F5E0B5" stroke="#E9A23B" strokeWidth="1.5"/>
      {/* produce in crate */}
      <circle cx="19" cy="32" r="3" fill="#E85C4A" fillOpacity="0.8"/>
      <circle cx="32" cy="32" r="3" fill="#4CAF50" fillOpacity="0.8"/>
      <circle cx="45" cy="32" r="3" fill="#E9A23B" fillOpacity="0.9"/>
    </svg>
  );
}

// Success illustration
export function IllustrationSuccess({ size = 80, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      <circle cx="40" cy="40" r="36" fill="#E8F5EE"/>
      <circle cx="40" cy="40" r="28" fill="#1B7A3D" fillOpacity="0.1"/>
      <path d="M24 40L35 51L56 29" stroke="#1B7A3D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Quality check icon
export function IconQuality({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L14.4 8.26L21 9.27L16.5 13.64L17.77 20.23L12 17L6.23 20.23L7.5 13.64L3 9.27L9.6 8.26L12 2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color} fillOpacity="0.1"/>
    </svg>
  );
}

export function IconSold({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 2L3 6V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V6L18 2H6Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color} fillOpacity="0.08"/>
      <path d="M3 6H21" stroke={color} strokeWidth="1.8"/>
      <path d="M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCamera({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M23 19C23 19.53 22.79 20.04 22.41 20.41C22.04 20.79 21.53 21 21 21H3C2.47 21 1.96 20.79 1.59 20.41C1.21 20.04 1 19.53 1 19V8C1 7.47 1.21 6.96 1.59 6.59C1.96 6.21 2.47 6 3 6H7L9 3H15L17 6H21C21.53 6 22.04 6.21 22.41 6.59C22.79 6.96 23 7.47 23 8V19Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color} fillOpacity="0.08"/>
      <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.12"/>
    </svg>
  );
}

export function IconShield({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L4 6V12C4 16.42 7.58 21 12 22C16.42 21 20 16.42 20 12V6L12 2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color} fillOpacity="0.1"/>
      <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconSettings({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8"/>
      <path d="M19.4 15C19.2 15.3 19.3 15.7 19.5 16L19.6 16.2C20.2 17.2 19.9 18.5 18.9 19.1L17.9 19.7C16.9 20.3 15.6 20 15 19L14.9 18.8C14.7 18.5 14.3 18.4 14 18.6C13.7 18.8 13.4 18.9 13 19C12.7 19.1 12.5 19.4 12.5 19.7V19.9C12.5 21.1 11.5 22 10.3 22H9.3C8.1 22 7.1 21.1 7.1 19.9V19.7C7.1 19.4 6.9 19.1 6.6 19C6.2 18.9 5.9 18.8 5.6 18.6C5.3 18.4 4.9 18.5 4.7 18.8L4.6 19C4 20 2.7 20.3 1.7 19.7L0.7 19.1C-0.3 18.5 -0.6 17.2 0 16.2L0.1 16C0.3 15.7 0.4 15.3 0.2 15C0.1 14.7 0 14.4 0 14C0 13.6 0.1 13.3 0.2 13C0.4 12.7 0.3 12.3 0.1 12L0 11.8C-0.6 10.8 -0.3 9.5 0.7 8.9L1.7 8.3C2.7 7.7 4 8 4.6 9L4.7 9.2C4.9 9.5 5.3 9.6 5.6 9.4C5.9 9.2 6.2 9.1 6.6 9C6.9 8.9 7.1 8.6 7.1 8.3V8.1C7.1 6.9 8.1 6 9.3 6H10.3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLogout({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17L21 12L16 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12H9" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function IconHelp({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.06"/>
      <path d="M9.09 9C9.32 8.33 9.77 7.77 10.37 7.4C10.97 7.03 11.68 6.87 12.37 6.95C13.06 7.03 13.7 7.34 14.18 7.84C14.66 8.34 14.94 8.99 14.95 9.68C14.95 12 11.95 13 11.95 13" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="17" r="1" fill={color}/>
    </svg>
  );
}

export function IconBank({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 10L12 3L21 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10H21" stroke={color} strokeWidth="1.8"/>
      <rect x="3" y="19" width="18" height="2" rx="1" fill={color} fillOpacity="0.3"/>
      <path d="M6 10V19M10 10V19M14 10V19M18 10V19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconHistory({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C9.27 21 6.84 19.78 5.2 17.85" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M3 7V12H8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 7V12L15 14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function IconSun({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.15"/>
      <path d="M12 3V5M12 19V21M3 12H5M19 12H21M5.64 5.64L7.05 7.05M16.95 16.95L18.36 18.36M18.36 5.64L16.95 7.05M7.05 16.95L5.64 18.36" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCloud({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 18H16.5C18.43 18 20 16.43 20 14.5C20 12.57 18.43 11 16.5 11C16.28 11 16.07 11.02 15.86 11.06C15.28 8.75 13.21 7 10.75 7C7.85 7 5.5 9.35 5.5 12.25C5.5 12.42 5.51 12.58 5.53 12.75C4.08 13.14 3 14.47 3 16C3 17.66 4.34 19 6 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill={color} fillOpacity="0.1"/>
    </svg>
  );
}

export function IconRain({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 15H16.5C18.43 15 20 13.43 20 11.5C20 9.57 18.43 8 16.5 8C16.28 8 16.07 8.02 15.86 8.06C15.28 5.75 13.21 4 10.75 4C7.85 4 5.5 6.35 5.5 9.25C5.5 9.42 5.51 9.58 5.53 9.75C4.08 10.14 3 11.47 3 13C3 14.66 4.34 16 6 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill={color} fillOpacity="0.1"/>
      <path d="M8 18L7 21M12 17.5L11 21M16 18L15 21" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function IconStorm({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 14H16.5C18.43 14 20 12.43 20 10.5C20 8.57 18.43 7 16.5 7C16.28 7 16.07 7.02 15.86 7.06C15.28 4.75 13.21 3 10.75 3C7.85 3 5.5 5.35 5.5 8.25C5.5 8.42 5.51 8.58 5.53 8.75C4.08 9.14 3 10.47 3 12C3 13.66 4.34 15 6 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill={color} fillOpacity="0.1"/>
      <path d="M13 14L9 19H13L11 23" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconGlobe({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.06"/>
      <path d="M12 3C12 3 9 7 9 12C9 17 12 21 12 21" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3C12 3 15 7 15 12C15 17 12 21 12 21" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 12H21" stroke={color} strokeWidth="1.5"/>
      <path d="M4.2 7H19.8M4.2 17H19.8" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconWind({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 10H15.5C16.88 10 18 8.88 18 7.5C18 6.12 16.88 5 15.5 5C14.12 5 13 6.12 13 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M4 14H18.5C19.88 14 21 15.12 21 16.5C21 17.88 19.88 19 18.5 19C17.12 19 16 17.88 16 16.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M4 12H11" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
