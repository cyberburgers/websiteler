import Image from "next/image";
import logo from "@/assets/brand/logo.png";

const SEEN = "splash-seen";

// Runs before the first paint. The intro plays once per visit: a reload or a second page in the
// same tab skips it, and the class is also set once it has finished so later page changes start at once.
const script = `try{var d=document.documentElement;if(sessionStorage.getItem("${SEEN}"))d.classList.add("${SEEN}");else{sessionStorage.setItem("${SEEN}","1");setTimeout(function(){d.classList.add("${SEEN}")},2000)}}catch(e){}`;

/** The shop's logo on navy for a moment as the site opens, then the menu rises in behind it. */
export function Splash() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <div
        aria-hidden="true"
        className="splash print-hidden pattern-star fixed inset-0 z-[100] grid place-items-center bg-lacivert-900"
      >
        <div className="splash-glow absolute size-[min(92vw,36rem)] rounded-full bg-[radial-gradient(closest-side,rgba(241,230,160,.26),transparent)]" />
        <Image
          src={logo}
          alt=""
          preload
          sizes="(min-width: 640px) 20rem, 66vw"
          className="splash-logo relative h-auto w-[min(66vw,20rem)] drop-shadow-[0_24px_40px_rgba(0,0,0,.45)]"
        />
      </div>
    </>
  );
}
