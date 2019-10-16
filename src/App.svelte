<script>
  // # # # # # # # # # # # # #
  //
  //  Main
  //
  // # # # # # # # # # # # # #

  // *** POLYFILLS
  // import "intersection-observer";
  // import "whatwg-fetch";

  // import "es6-shim";

  // *** IMPORT
  import { Router, Link, Route } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";
  import { client } from "./sanity.js";
  import get from "lodash/get";

  // *** COMPONENTS
  import ErosionMachine from "./eeefff/ErosionMachine.svelte";
  import Orb from "./Orb.svelte";

  // ROUTES
  import Publication from "./Publication.svelte";
  import EEEFFF from "./eeefff/EEEFFF.svelte";
  import OlofMarsja from "./olof-marsja/OlofMarsja.svelte";
  import AlinaChaiderov from "./alina-chaiderov/AlinaChaiderov.svelte";
  import Landing from "./Landing.svelte";

  // ** CONSTANTS
  const query = "*[]";

  // *** STORES
  import { textContent } from "./stores.js";

  textContent.set(loadData(query, {}));

  // const checkArray => arr => Array.isArray(arr) ? arr : false

  async function loadData(query, params) {
    try {
      const res = await client.fetch(query, params);

      if (!Array.isArray(res)) {
        throw "Return data is not an array";
        return false;
      }

      let contentContstruction = {
        introduction: {
          main: {},
          firstCycle: {}
        },
        artists: [],
        essays: [],
        credits: {}
      };

      contentContstruction.introduction.firstCycle = res.find(
        d => get(d, "slug.current", "") === "introduction"
      );

      contentContstruction.credits = res.find(
        d => get(d, "slug.current", "") === "credits"
      );

      contentContstruction.artists = res.filter(
        d => get(d, "_type", "") === "artist"
      );

      contentContstruction.essays = res.filter(
        d =>
          get(d, "_type", "") === "post" &&
          get(d, "slug.current", "") != "credits" &&
          get(d, "slug.current", "") != "introduction"
      );

      return contentContstruction;
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
    }
  }

  onMount(async () => {
    window.scrollTo(0, 0);
  });
</script>

<style lang="scss" global>
  body,
  html {
    height: 100%;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: black;
    color: white;
    margin: 0;
    padding: 0;
    font-family: "GT Pressura Mono", "Basis Grotesque Pro", "Akkurat-Mono",
      monospace;
    scroll-behavior: smooth;
    &.no-scroll {
      overflow: hidden;
    }
  }

  *,
  *:before,
  *:after {
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  a {
    text-decoration: none;
    color: currentColor;
  }

  p {
    margin-top: 0;
  }

  ::selection {
    background: #e4e4e4;
    /* WebKit/Blink Browsers */
  }

  ::-moz-selection {
    background: #e4e4e4;
    /* Gecko Browsers */
  }

  strong {
    font-weight: 700;
  }

  .tns-liveregion.tns-visually-hidden {
    display: none;
  }

  .pane img {
    max-width: 600px;
    max-height: 400px;
  }

  .pane figure {
    padding-left: 0;
    margin-left: 0;
  }
</style>

<Orb />

<ErosionMachine />
<Router>
  <Route path="/" component={Landing} />
  <Route path="/publication" component={Publication} />
  <Route path="eeefff" component={EEEFFF} />
  <Route path="olof-marsja" component={OlofMarsja} />
  <Route path="alina-chaiderov" component={AlinaChaiderov} />
</Router>
