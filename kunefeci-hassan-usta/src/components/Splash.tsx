const SEEN = "splash-seen";

// Runs before the first paint. The intro plays once per visit: a reload or a second page in the
// same tab skips it, and the class is also set once it has finished so later page changes start at once.
const script = `try{var d=document.documentElement;if(sessionStorage.getItem("${SEEN}"))d.classList.add("${SEEN}");else{sessionStorage.setItem("${SEEN}","1");setTimeout(function(){d.classList.add("${SEEN}")},2000)}}catch(e){}`;

/**
 * The shop's logo on the green theme colour for a moment as the site opens, then the menu rises in behind it.
 * The logo itself is drawn by `.splash-logo` in src/app/splash-logo.css.
 */
export function Splash() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <div
        aria-hidden="true"
        className="splash print-hidden pattern-star fixed inset-0 z-[100] grid place-items-center bg-zumrut-900"
      >
        <div className="splash-logo relative w-[min(66vw,20rem)] drop-shadow-[0_12px_20px_rgba(0,0,0,.35)]" />
      </div>
    </>
  );
}
