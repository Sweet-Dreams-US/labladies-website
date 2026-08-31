type IconProps = { className?: string };

const base = "h-6 w-6";

export function CheckIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="m7.5 12.4 3 3 6-6.4"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhoneIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M6.5 3.5h3l1.5 4-2 1.4a12.5 12.5 0 0 0 6.1 6.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChatIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-5 4V5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MailIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" />
      <path d="m4 7 8 5.5L20 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function PinIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 22s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
        fill="currentColor"
      />
      <circle cx="12" cy="10.5" r="2.6" fill="#fff" />
    </svg>
  );
}

export function ClockIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path
        d="M12 7v5.3l3.4 2"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DropIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 2.5s6.5 7.2 6.5 11.4a6.5 6.5 0 0 1-13 0C5.5 9.7 12 2.5 12 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ShieldIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M12 2.5 20 6v6.2c0 5-3.4 8-8 9.3-4.6-1.3-8-4.3-8-9.3V6l8-3.5Z" fill="currentColor" />
      <path d="M12 8v6M9 11h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BoltIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M13.5 2 5 13.5h5.2L9.5 22 19 10.2h-5.4L13.5 2Z" fill="currentColor" />
    </svg>
  );
}

export function ProviderIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M4 20a8 8 0 0 1 16 0v1H4v-1Z"
        fill="currentColor"
      />
      <circle cx="12" cy="7" r="4" fill="currentColor" />
      <path d="M12 14v4M10 16h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M3 11 12 3.5 21 11v9.5h-6.5v-6h-5v6H3V11Z" fill="currentColor" />
    </svg>
  );
}

export function SchoolIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M12 3.5 23 9l-11 5.5L1 9l11-5.5Z" fill="currentColor" />
      <path
        d="M5.5 11.5v4.8c0 1.6 3 3.2 6.5 3.2s6.5-1.6 6.5-3.2v-4.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M5 12h13m0 0-5.5-5.5M18 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.4l6.2-.9L12 2.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SpaIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 21c0-5 2.6-9.2 7-11-.6 5.6-3.2 9.4-7 11Zm0 0c0-5-2.6-9.2-7-11 .6 5.6 3.2 9.4 7 11Z"
        fill="currentColor"
      />
      <path d="M12 21v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="5" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function CourierIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M2 7.5h11V16H2V7.5Z" fill="currentColor" />
      <path d="M13 10.5h4.4L21 13.6V16h-8v-5.5Z" fill="currentColor" />
      <circle cx="7" cy="17.5" r="2.2" fill="currentColor" />
      <circle cx="17.5" cy="17.5" r="2.2" fill="currentColor" />
      <path d="M6 10.2h3M7.5 8.7v3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export const partnerIcons = {
  provider: ProviderIcon,
  home: HomeIcon,
  school: SchoolIcon,
  spa: SpaIcon,
  courier: CourierIcon,
};
