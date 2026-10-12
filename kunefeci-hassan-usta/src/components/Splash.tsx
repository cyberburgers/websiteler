const SEEN = "splash-seen";

// Runs before the first paint. The intro plays once per visit: a reload or a second page in the
// same tab skips it, and the class is also set once it has finished so later page changes start at once.
const script = `try{var d=document.documentElement;if(sessionStorage.getItem("${SEEN}"))d.classList.add("${SEEN}");else{sessionStorage.setItem("${SEEN}","1");setTimeout(function(){d.classList.add("${SEEN}")},1900)}}catch(e){}`;

/**
 * The opening, under two seconds: the logo fades in, a thin gold ring is drawn round it once with
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
