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
  import Landing from "./Landing.svelte";
  import Editorial from "./Editorial.svelte";
  import About from "./About.svelte";
  // CYCLE 1
  import CycleOne from "./CycleOne.svelte";
  import EEEFFF from "./eeefff/EEEFFF.svelte";
  import OlofMarsja from "./olof-marsja/OlofMarsja.svelte";
  import AlinaChaiderov from "./alina-chaiderov/AlinaChaiderov.svelte";
  // CYCLE 2
  import CycleTwo from "./CycleTwo.svelte";
  import HanniKamaly from "./hanni-kamaly/HanniKamaly.svelte";
  import StineJanvin from "./stine-janvin/StineJanvin.svelte";
  import HebaYAmin from "./heba-y-amin/HebaYAmin.svelte";
  import AnnaRunTryggvadottir from "./anna-run-tryggvadottir/AnnaRunTryggvadottir.svelte";

  // ** CONSTANTS
  const query =
    "*[ _type == 'cycleTwo' || _type == 'cycleOne' || _type == 'liquidFiction' || _type == 'editorial' ] | order(customOrder asc)";

  // *** STORES
  import { textContent, activePage } from "./stores.js";

  textContent.set(loadData(query, {}));

  async function loadData(query, params) {
    try {
      const res = await client.fetch(query, params);

      if (!Array.isArray(res)) {
        throw "Return data is not an array";
        return false;
      }

      let contentContstruction = {
        liquidFiction: [],
        editorial: [],
        cycleOne: []
      };

      contentContstruction.cycleOne = res.filter(
        d => get(d, "_type", "") === "cycleOne"
      );

      contentContstruction.cycleTwo = res.filter(
        d => get(d, "_type", "") === "cycleTwo"
      );

      contentContstruction.editorial = res.filter(
        d => get(d, "_type", "") === "editorial"
      );

      contentContstruction.liquidFiction = res.filter(
        d => get(d, "_type", "") === "liquidFiction"
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
  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow-x: hidden;
    scroll-behavior: smooth;

    &.no-scroll {
      overflow: hidden;
    }
  }

  body {
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
    font-feature-settings: "liga";

    background-color: #000;
    color: #fff;
    margin: 0;
    padding: 0;
    width: 100vw;
    overflow-x: hidden;
    font-family: "GT Pressura Mono", "Basis Grotesque Pro", "Akkurat-Mono",
      monospace;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  ::-webkit-scrollbar {
    width: 0px;
  }

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

  .pane {
    img {
      width: auto;
      max-height: 400px;
      max-width: calc(100% - 2rem);
    }

    figure {
      padding-left: 0;
      margin-left: 0;
      margin-top: 1rem;
      margin-bottom: 1rem;
      img {
        max-width: 100%;
        height: auto;
        max-width: 39.292rem;
      }
    }

    p {
      font-size: 16px;
      font-weight: normal;
      line-height: 1.333;
      max-width: 39.292rem;
    }

    .editorial-audio {
      width: 39.292rem;
      margin-bottom: 1em;
    }

    &.large {
      p {
        font-size: 21.33px;
        line-height: 1.333;
        font-weight: 300;
      }
    }
  }

  .pane .pane a {
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

  .hanni-kamaly-page,
  .hanni-kamaly-popup {
    a {
      border-bottom: 3px dashed currentColor;
      &:hover {
        border-bottom: 3px dashed transparent;
      }
    }

    img {
      max-width: 90%;
    }

    .detour {
      border-bottom: 3px dashed rgba(255, 255, 0, 1);
      cursor: pointer;
      &:hover {
        background: rgba(255, 255, 0, 1);
        border-bottom: 3px solidtransparent;
      }
    }
  }

  .hanni-kamaly-page,
  .hanni-kamaly-popup {
    p,
    h1,
    h2,
    h3,
    blockquote {
      width: 700px;
      max-width: 90%;
      margin-left: auto;
      margin-right: auto;
    }

    blockquote {
      padding-left: 0em;
      font-size: 1.6em;
      font-family: serif;
      font-style: italic;
    }

    img {
      display: block;
      max-width: 80%;
      margin-left: auto;
      margin-right: auto;
      user-select: none;
    }

    video {
      max-width: 90%;
      display: block;
      max-height: 500px;
      margin-left: auto;
      margin-right: auto;
      outline: none;
      margin-top: 1em;
    }

    audio {
      display: block;
      margin-left: auto;
      margin-right: auto;
      margin-top: 1em;
      outline: none;
      margin-bottom: 1em;
    }

    iframe {
      margin-top: 1em;
      display: block;
      max-width: 700px;
      max-height: 500px;
      margin-left: auto;
      margin-right: auto;
      outline: none;
      margin-bottom: 1em;
    }
  }
</style>

<Orb />

<Router>
  <Route path="/" component={Landing} />
  <Route path="liquid-fiction" component={About} />
  <Route path="editorial" component={Editorial} />
  <!-- CYCLE 1 -->
  <Route path="cycle-1" component={CycleOne} />
  <Route path="eeefff" component={EEEFFF} />
  <Route path="olof-marsja" component={OlofMarsja} />
  <Route path="alina-chaiderov" component={AlinaChaiderov} />
  <!-- CYCLE 2 -->
  <Route path="cycle-2" component={CycleTwo} />
  <Route path="hanni-kamaly" component={HanniKamaly} />
  <Route path="stine-janvin" component={StineJanvin} />
  <Route path="heba-y-amin" component={HebaYAmin} />
  <Route path="anna-run-tryggvadottir" component={AnnaRunTryggvadottir} />
  <Route path="anna-run-tryggvadottir/:slug" component={AnnaRunTryggvadottir} />

</Router>
