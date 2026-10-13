"use client";

import { HandPlatter, Plus, Send } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { useSentOrder } from "@/lib/order/cart";
import { useOrdering } from "./OrderProvider";

const KEY = "masa-bilgi";
const EVENT = "masa-bilgi:kapandi";

function closed() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

function close() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Without storage it comes back on the next page; harmless.
  }
  window.dispatchEvent(new Event(EVENT));
}

/**
 * At a table, before the first order: how ordering from the menu works, in three steps, so "Ekle" isn't
 * taken for a delivery order. It goes for the rest of the visit with "Anladım" or once an order is sent.
 */
export function TableIntro() {
  const ordering = useOrdering();
  const sent = useSentOrder();
  const hidden = useSyncExternalStore(subscribe, closed, () => true);

  // Someone who has sent an order knows how it works, also after "Afiyet olsun" clears the order.
  useEffect(() => {
    if (sent) close();
  }, [sent]);

  if (!ordering?.canOrder || !ordering.table || hidden || sent) return null;
  const { labels } = ordering;
  const steps = [
    { Icon: Plus, text: labels.introStep1 },
    { Icon: Send, text: labels.introStep2 },
    { Icon: HandPlatter, text: labels.introStep3 },
  ];

  // Kept small: the title with "Anladım", three little boxes, one line of note.
  return (
    <section
      aria-labelledby="masa-bilgi-baslik"
      data-masa-bilgi=""
      className="animate-pop-in mt-4 rounded-[22px] bg-krem-50/[0.06] p-3 ring-1 ring-inset ring-fistik-300/25 md:mb-4 md:mt-0"
    >
      <div className="flex items-center justify-between gap-3 ps-1">
        <h2 id="masa-bilgi-baslik" className="font-display text-[18px] font-semibold leading-tight text-krem-50">
          {labels.introTitle}
        </h2>
        <button
          type="button"
          onClick={close}
          className="h-8 shrink-0 rounded-full bg-fistik-300 px-3.5 text-[12.5px] font-extrabold text-zumrut-925 transition hover:bg-fistik-200 active:scale-95"
        >
          {labels.introOk}
        </button>
      </div>
      <ol className="mt-2.5 grid grid-cols-3 gap-1.5">
        {steps.map(({ Icon, text }, i) => (
          <li key={i} className="rounded-xl bg-zumrut-950/45 px-1.5 pb-2 pt-2.5 text-center">
            <span className="mx-auto grid size-7 place-items-center rounded-full bg-fistik-300 text-zumrut-925">
              <Icon className="size-4" strokeWidth={2.4} aria-hidden="true" />
            </span>
            <span className="mt-1.5 block text-[12px] font-bold leading-tight text-krem-100">
              <span className="sr-only">{i + 1}. </span>
              {text}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-2 px-1 text-[11.5px] leading-snug text-krem-100/60">{labels.introNote}</p>
    </section>
  );
}
