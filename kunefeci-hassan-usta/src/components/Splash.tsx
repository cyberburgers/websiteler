const SEEN = "splash-seen";
const KEY = "acilis-goruldu";
/** After the first open, a phone doesn't see the opening again for this long. */
const AGAIN_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

// Runs before the first paint. The opening plays on a phone's first visit only: scanning the table's
// QR again (a new tab), a reload or another page skips it for a month. The class is also set once it
// has finished, so later page changes start at once. Without storage (some private modes) it is skipped.
const script = `(function(){var d=document.documentElement;try{var t=+localStorage.getItem("${KEY}")||0,n=Date.now();if(n-t<${AGAIN_AFTER_MS}){d.classList.add("${SEEN}");return}localStorage.setItem("${KEY}",String(n));setTimeout(function(){d.classList.add("${SEEN}")},1900)}catch(e){d.classList.add("${SEEN}")}})()`;

/**
 * The opening on a phone's first visit, under two seconds: the logo fades in, a thin gold ring is drawn round it once with
 * "Şanlıurfa" underneath, and as soon as the ring is closed the opening fades and the menu rises.
 * The timing lives in globals.css (".splash"), the logo image in splash-logo.css.
 */
export function Splash() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <div aria-hidden="true" className="splash print-hidden">
        <div className="splash-pattern pattern-star" />
        <div className="splash-stage">
          <div className="splash-glow" />
          <div className="splash-mark">
            {/* The ring sits on the badge's own centre, which is right of the image's middle. */}
            <svg className="splash-ring" viewBox="0 0 560 431" fill="none">
              <circle cx="316" cy="213" r="226" transform="rotate(-90 316 213)" />
            </svg>
            <div className="splash-logo" />
          </div>
          <p className="splash-place">
            <span />
            Şanlıurfa
            <span />
          </p>
        </div>
      </div>
    </>
  );
}
