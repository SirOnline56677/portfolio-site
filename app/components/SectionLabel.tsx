export default function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="font-[family-name:var(--font-display)] text-section uppercase text-ink">
      {children}
    </span>
  );
}
