import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero shell">
      <div className="section-heading"><p>ERROR_404 / LOST LEVEL</p><h1>PAGE NOT FOUND</h1></div>
      <p className="page-lede">This route is not part of the current mission map.</p>
      <p><Link className="brutal-button" href="/">RETURN HOME →</Link></p>
    </section>
  );
}
