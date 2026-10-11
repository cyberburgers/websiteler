"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

type Props = {
  src: string;
  title: string;
  loadLabel: string;
  note: string;
};

/**
 * The Google map loads only after a tap: no third-party cookies or requests
 * until the visitor asks for them (KVKK), and a faster first page load.
 */
export function MapEmbed({ src, title, loadLabel, note }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-lacivert-800 ring-1 ring-krem-50/15 sm:aspect-[16/11]">
      {show ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <>
          <svg
            aria-hidden="true"
            viewBox="0 0 400 280"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 size-full"
          >
            <rect width="400" height="280" fill="#23264a" />
            <g fill="none" stroke="#f1e6a0" strokeOpacity=".12" strokeWidth="10" strokeLinecap="round">
              <path d="M-20 70 C 80 40, 160 120, 420 60" />
              <path d="M-20 210 C 120 230, 220 150, 420 200" />
              <path d="M110 -20 C 140 90, 90 190, 140 300" />
              <path d="M300 -20 C 260 100, 330 180, 290 300" />
            </g>
            <g fill="none" stroke="#f1e6a0" strokeOpacity=".07" strokeWidth="3">
              <path d="M-20 140 H 420" />
              <path d="M200 -20 V 300" />
              <path d="M20 20 L 380 260" />
            </g>
            <circle cx="200" cy="140" r="58" fill="#dd9530" fillOpacity=".12" />
            <circle cx="200" cy="140" r="30" fill="#dd9530" fillOpacity=".18" />
          </svg>
          <div className="relative flex size-full flex-col items-center justify-center gap-5 p-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-sari-300 text-lacivert-900 shadow-[0_0_0_10px_rgba(241,230,160,.12)]">
              <MapPin className="size-7" aria-hidden="true" />
            </span>
            <button
              type="button"
              onClick={() => setShow(true)}
              className="rounded-full bg-krem-50 px-6 py-3 text-[15px] font-bold text-lacivert-900 transition hover:bg-sari-200"
            >
              {loadLabel}
            </button>
            <p className="max-w-xs text-xs leading-relaxed text-krem-100/55">{note}</p>
          </div>
        </>
      )}
    </div>
  );
}
