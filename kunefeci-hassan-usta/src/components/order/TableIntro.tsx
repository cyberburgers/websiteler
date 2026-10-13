"use client";

import { ChevronRight, HandPlatter } from "lucide-react";
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
  const steps = [labels.introStep1, labels.introStep2, labels.introStep3];

  // Small on purpose: one line with the title, one with the steps, one with the note.
  return (
    <section
      aria-labelledby="masa-bilgi-baslik"
      data-masa-bilgi=""
      className="animate-pop-in mt-4 rounded-2xl bg-krem-50/[0.06] px-3.5 py-3 ring-1 ring-inset ring-fistik-300/25 md:mb-4 md:mt-0"
    >
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-fistik-300 text-zumrut-925">
          <HandPlatter className="size-4" strokeWidth={2.4} aria-hidden="true" />
        </span>
        <h2 id="masa-bilgi-baslik" className="min-w-0 flex-1 text-[15px] font-extrabold leading-tight text-krem-50">
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
      <ol className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[12.5px] font-bold leading-snug text-krem-100">
        {steps.map((text, i) => (
          <li key={i} className="inline-flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 text-fistik-300" strokeWidth={2.6} aria-hidden="true" />}
            <span className="sr-only">{i + 1}. </span>
            {text}
          </li>
        ))}
      </ol>
      <p className="mt-0.5 text-[12px] leading-snug text-krem-100/60">{labels.introNote}</p>
    </section>
  );
}
