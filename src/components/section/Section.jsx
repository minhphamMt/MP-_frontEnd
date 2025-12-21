export default function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <div className="space-y-1">{children}</div>
    </section>
  );
}
