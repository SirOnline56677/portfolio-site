export default function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="font-[family-name:var(--font-display)] text-[20px] leading-[23px] tracking-[0.03em] uppercase text-ink">
      {children}
    </span>
  );
}
