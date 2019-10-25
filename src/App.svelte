<script>
  // # # # # # # # # # # # # #
  //
  //  Main
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { Router, Link, Route } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";
  import { client } from "./sanity.js";
  import get from "lodash/get";

  // *** COMPONENTS
  import Orb from "./Orb.svelte";

  // ROUTES
  import Editorial from "./Editorial.svelte";
  import About from "./About.svelte";
  import CycleOne from "./CycleOne.svelte";
  import EEEFFF from "./eeefff/EEEFFF.svelte";
  import OlofMarsja from "./olof-marsja/OlofMarsja.svelte";
  import AlinaChaiderov from "./alina-chaiderov/AlinaChaiderov.svelte";
  import Landing from "./Landing.svelte";

  // ** CONSTANTS
  const query = "*[]";

  // *** STORES
  import { textContent, activePage } from "./stores.js";

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

      contentContstruction.introduction.main = res.find(
        d => get(d, "slug.current", "") === "introduction"
      );

      contentContstruction.introduction.firstCycle = res.find(
        d => get(d, "slug.current", "") === "cycle-one"
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
          get(d, "slug.current", "") != "introduction" &&
          get(d, "slug.current", "") != "cycle-one"
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

  html, body{
    margin: 0;
    padding: 0;
    height: 100%;
    overflow-x: hidden;
    scroll-behavior: smooth;

    &.no-scroll {
      overflow: hidden;
    }
  }

  body{
    text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;

    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -ms-overflow-style: scrollbar;

    font-smoothing: antialiased;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;

    font-variant-ligatures: common-ligatures;
    font-feature-settings: 'liga';

    background-color: #000;
    color: #FFF;
    margin: 0;
    padding: 0;
    font-family: "GT Pressura Mono", "Basis Grotesque Pro", "Akkurat-Mono", monospace;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  ::-webkit-scrollbar {width: 0px;}

  a {
    text-decoration: none;
    color: currentColor;
  }

  p {
    margin-top: 0;
  }

  ::selection {
    background-color: #e4e4e4;
  }

  ::-moz-selection {
    background-color: #e4e4e4;
  }

  strong {
    font-weight: 700;
  }

  .tns-liveregion.tns-visually-hidden {
    display: none;
  }

  .pane img {
    width: auto;
    max-height: 400px;
    max-width: calc(100% - 2rem);
  }

  .pane figure {
    padding-left: 0;
    margin-left: 0;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

    .pane figure img{
      max-width: 100%;
      height: auto;
    }


  .pane p {
    font-size: 16px;
    font-weight: normal;
    line-height: 1.333;
    max-width: 39.292rem;
  }

  .pane.introduction p {
    font-size: 21.33px;
    line-height: 1.333;
    font-weight: 300;
  }

  .pane a {
    border-bottom: 1px solid currentColor;
    &:hover {
      border-bottom: 1px solid transparent;
    }
  }

  video {
    max-width: 100vw;
  }

  img {
    max-width: 100vw;
    max-height: 100vh;
  }

  .timeline-event--hidden {
    visibility: hidden;
    pointer-events: none;
  }
</style>

<Orb />

<Router>
  <Route path="/" component={Landing} />
  <Route path="/liquid-fiction" component={About} />
  <Route path="/editorial" component={Editorial} />
  <Route path="/cycle-1" component={CycleOne} />
  <Route path="eeefff" component={EEEFFF} />
  <Route path="olof-marsja" component={OlofMarsja} />
  <Route path="alina-chaiderov" component={AlinaChaiderov} />
</Router>
