// CSS-only entrance (see .page-enter in globals.css): works before JavaScript loads, so the
// server-rendered page is never hidden at opacity 0 waiting for hydration.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
