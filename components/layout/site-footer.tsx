import Link from "next/link";
import type { Contacts } from "@/lib/firebase/types";

export function SiteFooter({ contacts }: { contacts: Contacts }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <p>BASED IN MALANG, INDONESIA</p>
        <div className="footer-links">
          {contacts.github && <Link href={contacts.github}>GITHUB</Link>}
          {contacts.linkedin && <Link href={contacts.linkedin}>LINKEDIN</Link>}
          {contacts.email && <Link href={`mailto:${contacts.email}`}>EMAIL</Link>}
        </div>
        <p>© {new Date().getFullYear()} DWI HERU</p>
      </div>
    </footer>
  );
}
