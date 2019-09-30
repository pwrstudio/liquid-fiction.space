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

  // *** COMPONENTS
  import ErosionMachine from "./eeefff/ErosionMachine.svelte";
  import Orb from "./Orb.svelte";

  // ROUTES
  import About from "./About.svelte";
  import EEEFFF from "./eeefff/EEEFFF.svelte";
  import OlofMarsja from "./olof-marsja/OlofMarsja.svelte";
  import AlinaChaiderov from "./alina-chaiderov/AlinaChaiderov.svelte";
  import Landing from "./Landing.svelte";
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
    font-weight: 500;
  }

  .tns-liveregion.tns-visually-hidden {
    display: none;
  }
</style>

<Orb />

<ErosionMachine />

<Router>
  <Route path="/" component={Landing} />
  <Route path="/about" component={About} />
  <Route path="eeefff" component={EEEFFF} />
  <Route path="olof-marsja" component={OlofMarsja} />
  <Route path="alina-chaiderov" component={AlinaChaiderov} />
</Router>
