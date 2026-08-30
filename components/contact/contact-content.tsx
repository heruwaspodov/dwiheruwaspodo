"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLivePortfolioData } from "@/lib/firebase/use-live-data";
import type { PortfolioData } from "@/lib/firebase/types";

export function ContactContent({ initialData }: { initialData: PortfolioData }) {
  const data = useLivePortfolioData(initialData);
  const dialog = useRef<HTMLDialogElement>(null);
  const [formLoaded, setFormLoaded] = useState(false);

  const openForm = () => {
    setFormLoaded(true);
    dialog.current?.showModal();
  };

  return (
    <>
      <section className="page-hero shell">
        <div className="section-heading"><p>NEW_MESSAGE / OPEN CHANNEL</p><h1>CONTACT</h1></div>
        <p className="page-lede">Have a system to improve, a product to ship, or an engineering challenge worth discussing? Send the brief.</p>
      </section>

      <section className="contact-layout shell">
        <article className="brutal-card contact-card">
          <h2>Player Contact</h2>
          <dl className="contact-list">
            <div><dt>EMAIL</dt><dd><Link href={`mailto:${data.contacts.email}`}>{data.contacts.email}</Link></dd></div>
            <div><dt>PHONE</dt><dd>{data.contacts.phone}</dd></div>
            <div><dt>LOCATION</dt><dd>{data.bio.domicile}, {data.bio.country}</dd></div>
            {data.bio.cv && <div><dt>CV</dt><dd><Link href={data.bio.cv} target="_blank" rel="noreferrer">Download latest PDF ↗</Link></dd></div>}
          </dl>
          <div className="contact-actions">
            {data.bio.form && <button className="brutal-button red" type="button" onClick={openForm}>OPEN MESSAGE FORM →</button>}
            {data.contacts.linkedin && <Link className="brutal-button secondary" href={data.contacts.linkedin}>LINKEDIN ↗</Link>}
          </div>
        </article>

        <div className="map-panel" aria-label={`Stylized map marker for ${data.bio.domicile}, ${data.bio.country}`}>
          <div className="map-pin"><span>MALANG<br />ID</span></div>
          <p className="map-caption">COORDINATES LOCKED / GMT+7</p>
        </div>
      </section>

      <dialog ref={dialog} className="typeform-dialog" onClose={() => setFormLoaded(false)}>
        <div className="dialog-bar"><span>CONTACT_FORM.TYPEFORM</span><button type="button" onClick={() => dialog.current?.close()}>CLOSE ×</button></div>
        {formLoaded && data.bio.form && <iframe src={data.bio.form} title="Contact Dwi Heru" allow="camera; microphone; autoplay; encrypted-media" />}
      </dialog>
    </>
  );
}
