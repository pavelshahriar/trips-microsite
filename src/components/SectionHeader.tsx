interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeader({
  label,
  title,
  subtitle,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div className={`mb-10 ${centered ? "text-center" : ""}`}>
      {label && (
        <span
          className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
          style={{
            color: "var(--color-accent)",
            background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
          }}
        >
          {label}
        </span>
      )}
      <h2
        className="text-3xl sm:text-4xl font-bold mb-3 leading-tight"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-muted)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
