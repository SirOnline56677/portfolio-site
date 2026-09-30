import { MEASUREMENT_ID } from "./Analytics";
import { CS_OPT_OUT } from "./Contentsquare";

// A per-browser switch that keeps Stephen's own visits out of the numbers.
//
// Visiting /?analytics=off remembers the choice in localStorage for that
// browser, and /?analytics=on undoes it. Once set, every later visit from
// that browser is silent, on any page, with no query string needed.
//
// Chosen over an IP filter in the Google Analytics console because a home IP
// changes, and because this also covers a phone on mobile data, a coffee shop
// and any other network. The cost is that each browser he uses has to be
// switched off once.
//
// Both tools are turned off through their own documented opt-outs rather than
// by refusing to load their scripts. That keeps this a plain static page with
// no per-visitor rendering:
//   - Google reads window['ga-disable-<id>'] when it sends, so setting it
//     before gtag loads stops every hit.
//   - Contentsquare processes its _uxa queue on load, so an "optout" pushed
//     beforehand is honoured, drops a _cs_optout cookie and clears the rest.
//
// This is a blocking inline script in <head>, like the theme script above it,
// because both tags load afterInteractive and this has to be true before they
// go looking. Storage access is try/caught: some private-browsing modes throw
// on read, and the safe answer there is to behave like an ordinary visitor.
const SCRIPT = `(function(){var K="no-analytics",s=location.search,o=false;
try{if(/[?&]analytics=off(&|$)/.test(s)){localStorage.setItem(K,"1")}else if(/[?&]analytics=on(&|$)/.test(s)){localStorage.removeItem(K)}}catch(e){}
try{o=localStorage.getItem(K)==="1"}catch(e){}
if(!o)return;
window[${JSON.stringify(`ga-disable-${MEASUREMENT_ID}`)}]=true;
window.${CS_OPT_OUT}=window.${CS_OPT_OUT}||[];window.${CS_OPT_OUT}.push(["optout"]);
try{console.info("Analytics off for this browser. Visit /?analytics=on to undo.")}catch(e){}})();`;

export default function AnalyticsOptOut() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
