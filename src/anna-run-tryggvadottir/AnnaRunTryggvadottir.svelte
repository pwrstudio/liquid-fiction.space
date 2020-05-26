<script>
  // # # # # # # # # # # # # #
  //
  //  ANNA RUN TRYGGVADOTTIR
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { annaClient, urlForAnna } from "../sanity.js";
  import getVideoId from "get-video-id";
  import { links } from "svelte-routing";
  import cytoscape from "cytoscape";
  import sampleSize from "lodash/sampleSize";
  import sample from "lodash/sample";
  import kebabCase from "lodash/kebabCase";

  import _ from "lodash";

  // *** COMPONENTS
  import ErosionMachine from "../eeefff/ErosionMachine.svelte";

  export let slug = false;

  // *** STORES
  import {
    menuActive,
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition,
    activePage
  } from "../stores.js";

  // ** CONSTANTS
  const query = '*[ _type in ["rawText", "rawImage", "rawVideo"]]';

  let combinedKeywords = {};
  let cy = {};
  let layoutLoaded = false;

  let popUpActive = false;
  let popUpTitle = false;
  let popUpText = false;
  let popUpImage = false;
  let popUpVideo = false;

  activePage.set("anna");
  orbBackgroundOne.set("rgba(244,164,96,1)");
  orbBackgroundTwo.set("rgba(222,184,135,1)");

  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");

  orbPosition.set({
    top: "10px",
    left: "10px"
  });

  async function loadData(query, params) {
    try {
      const res = await annaClient.fetch(query, params);
      // console.dir(res);
      return res;
    } catch (err) {
      // console.log(err);
      Sentry.captureException(err);
    }
  }

  const raw = loadData(query);

  raw.then(rawData => {
    let allWords = [];

    let rawProcessed = rawData.map(r => {
      if (r.metadata) {
        r.keywords = _.words(r.metadata);
        allWords = allWords.concat(r.keywords);
      } else if (r.textContent) {
        r.keywords = _.words(r.textContent);
        allWords = allWords.concat(r.keywords);
      }
      return r;
    });

    console.dir(rawProcessed);

    // NODE LIST
    const nodeList = rawProcessed.map(p => {
      const imageUrl =
        p._type == "rawImage"
          ? urlForAnna(p.imageContent)
              .width(300)
              .quality(90)
              .auto("format")
              .url()
          : "";
      const fullImageUrl =
        p._type == "rawImage"
          ? urlForAnna(p.imageContent)
              .width(800)
              .quality(90)
              .auto("format")
              .url()
          : "";
      const obj = {
        data: {
          title: p.title,
          id: p._id,
          image: imageUrl,
          type: p._type,
          fullImage: fullImageUrl,
          text: p._type == "rawText" ? p.textContent : false,
          video: p._type == "rawVideo" ? p.videoUrl : false
        },
        classes: [kebabCase(p._type)]
      };
      return obj;
    });

    // POSSIBLY FILTER TARGETS
    // const targets = sampleSize(nodeList, 20);
    const targets = nodeList;
    console.dir(targets);

    // EDGE LIST
    const edgeList = nodeList.map(p => {
      const obj = {
        data: {
          source: p.data.id,
          target: sample(targets).data.id
        }
      };
      return obj;
    });
    console.dir(edgeList);

    // combinedKeywords = _.reverse(
    //   _.sortBy(_.map(_.groupBy(allWords), w => [w[0], w.length]), x => x[1])
    // );

    // console.dir(combinedKeywords);
    cy = cytoscape({
      container: document.getElementById("graph"),
      boxSelectionEnabled: false,
      minZoom: 0.2,
      maxZoom: 6,
      motionBlur: true,

      style: cytoscape
        .stylesheet()
        .selector("node")
        .css({
          height: 120,
          width: 120,
          "background-fit": "cover",
          "border-color": "#000",
          "background-color": "#0000FF",
          "border-width": 0,
          "border-opacity": 0,
          shape: "circle"
        })
        .selector("edge")
        .css({
          "curve-style": "unbundled-bezier",
          width: 6,
          "line-gradient-stop-colors": "red orange",
          "line-fill": "linear-gradient",
          "line-color": "#ffffff"
        })
        .selector(".raw-video")
        .css({
          shape: "rectangle",
          height: 120,
          width: 120
        })
        .selector(".raw-text")
        .css({
          shape: "circle",
          height: 120,
          width: 120
        }),

      elements: {
        nodes: nodeList,
        edges: edgeList
      },

      layout: {
        name: "cose",
        fit: true,
        componentSpacing: 40,
        padding: 30,
        nodeRepulsion: function(node) {
          return 6048;
        },
        randomize: true,
        gravity: 10
      }
    }); // cy init

    cy.on("click", "node", evt => {
      popUpActive = false;
      popUpTitle = false;
      popUpText = false;
      popUpImage = false;
      popUpVideo = false;

      // console.log(evt.target.data());
      // console.dir(cy.$("#" + evt.target.data().id));

      const targetEl = cy.$("#" + evt.target.data().id);

      const pos = targetEl.position();
      const renderedPos = targetEl.renderedPosition();

      setTimeout(() => {
        popUpTitle = evt.target.data().title;
        popUpText = evt.target.data().text;
        popUpImage = evt.target.data().fullImage;
        popUpVideo = evt.target.data().video;
        popUpActive = true;
      }, 500);

      // console.dir(pos);
      // console.dir(renderedPos);

      // console.log(cy.zoom());
      // cy.zoom(2.1);

      // cy.zoom({
      //   // Zoom to the specified position
      //   level: 3, // 0 <= yourLevel, maybe try out 1,2,3,4... and see what fits
      //   position: pos
      // });

      // if (cy.zoom() == 2) {
      //   cy.animate(
      //     {
      //       pan: renderedPos
      //       // zoom: {
      //       //   level: 2,
      //       //   renderedPosition: renderedPos
      //       // }
      //     },
      //     {
      //       duration: 1000,
      //       easing: "ease-out-quad"
      //     }
      //   );
      // } else {
      cy.animate({
        zoom: {
          level: 2,
          renderedPosition: renderedPos
        },
        center: renderedPos,
        duration: 1000,
        easing: "ease-out-quad"
      });
    });

    cy.on("layoutstop", e => {
      layoutLoaded = true;

      // setTimeout(() => {
      //   cy.animate(
      //     {
      //       // pan: pos
      //       zoom: 1
      //     },
      //     {
      //       duration: 3000,
      //       easing: "ease-out"
      //     }
      //   );
      // }, 1000);
    });

    nodeList.forEach(n => {
      // console.log(n.data.id);
      let el = cy.$("#" + n.data.id)[0];
      // console.dir(el);
      el.style("background-image", n.data.image);
    });

    // console.dir(rawProcessed.reduce(x => x.keywords));

    // const allKeys = _.groupBy([6.1, 4.2, 6.3], Math.floor);

    return rawProcessed;
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .anna {
    background: navy;
    width: 100vw;
    height: 100vh;
    position: absolute;
    left: 0;
    top: 0;

    // display: inline-block;

    @include screen-size("small") {
      overflow-x: scroll;
    }
  }

  .pop-up {
    position: fixed;
    top: 10px;
    right: 10px;
    width: 600px;
    min-height: 300px;
    background: #0473fa;
    padding: 10px;
    cursor: pointer;

    img {
      max-width: 100%;
    }
  }

  .post {
    margin: 20px;
    width: 300px;
    float: left;

    img {
      width: 100%;
    }
  }

  .source {
    background: grey;
    padding: 10px;
    margin-top: 10px;
  }

  .index {
    background: red;
    display: block;
    width: 100%;
    float: left;
  }

  .metadata {
    background: green;
    transition: border 2s ease-out;

    a {
      margin-right: 0.5em;
      display: inline-block;
      border-bottom: 2px solid transparent;

      &.active {
        background: yellow;
      }

      &:hover {
        border-bottom: 2px solid black;
      }
    }
  }

  .graph {
    background: navy;
    width: 100vw;
    height: 100vh;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    transition: opacity 0.5s ease-out;

    &.loaded {
      opacity: 1;
    }
  }
</style>

<svelte:head>
  <title>Anna Rún Tryggvadottir | LIQUID FICTION</title>
</svelte:head>

<div class="anna">
  <div id="graph" class="graph" class:loaded={layoutLoaded} />

  {#if popUpActive}
    <div
      class="pop-up"
      in:fade
      on:click={() => {
        popUpActive = false;
      }}>
      <h2>{popUpTitle}</h2>
      {#if popUpImage}
        <img src={popUpImage} />
      {/if}
      {#if popUpText}
        <div>{popUpText}</div>
      {/if}
      {#if popUpVideo}
        {#if popUpVideo.includes('youtube')}
          <iframe
            width="480"
            height="320"
            src="https://www.youtube.com/embed/{getVideoId(popUpVideo).id}"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope;
            picture-in-picture"
            allowfullscreen />
        {/if}
        {#if popUpVideo.includes('vimeo')}
          <iframe
            width="480"
            height="320"
            src="https://player.vimeo.com/video/{getVideoId(popUpVideo).id}"
            frameborder="0"
            byline="false"
            color="#ffffff"
            allow="autoplay; fullscreen"
            allowfullscreen />
        {/if}
      {/if}
    </div>
  {/if}
</div>

<!-- <ErosionMachine /> -->
