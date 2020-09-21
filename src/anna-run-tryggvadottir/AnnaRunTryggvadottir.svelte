<script>
  // # # # # # # # # # # # # #
  //
  //  ANNA RUN TRYGGVADOTTIR
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { fade } from "svelte/transition"
  import { annaClient, urlForAnna } from "../sanity.js"
  import getVideoId from "get-video-id"
  import sample from "lodash/sample"
  import kebabCase from "lodash/kebabCase"
  import map from "lodash/map"
  import groupBy from "lodash/groupBy"
  import cytoscape from "cytoscape"

  // *** PROPS
  export let slug = false

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition,
    activePage,
  } from "../stores.js"

  // ** CONSTANTS
  const query = '*[ _type in ["rawText", "rawImage", "rawVideo"]]'

  let cy = {}
  let layoutLoaded = false

  let popUpActive = false
  let popUpTitle = false
  let popUpText = false
  let popUpImage = false
  let popUpVideo = false
  let popUpKeywords = []
  let popUpSource = false

  let edgePopUpActive = false
  let edgeTerm = ""

  activePage.set("anna")
  orbBackgroundOne.set("rgba(244,164,96,1)")
  orbBackgroundTwo.set("rgba(222,184,135,1)")

  orbColorOne.set("rgba(255,255,255,1)")
  orbColorTwo.set("rgba(0,0,0,1)")

  orbPosition.set({
    top: "10px",
    left: "10px",
  })

  async function loadData(query, params) {
    try {
      const res = await annaClient.fetch(query, params)
      // console.dir(res);
      return res
    } catch (err) {
      // console.log(err);
      Sentry.captureException(err)
    }
  }

  const raw = loadData(query)

  raw.then((rawData) => {
    // console.dir(rawData);
    const keyWordReducer = (a, r) => a.concat(r.keywords)
    let allWords = rawData.reduce(keyWordReducer, [])
    // console.log("all");
    // console.dir(allWords);

    const combinedKeywords = map(groupBy(allWords), (w) => [w[0], w.length])
    // console.log("combined");
    // console.dir(combinedKeywords);

    const sharedKeywords = combinedKeywords
      .filter((w) => w[1] > 1)
      .map((w) => w[0])
    // console.log("shared");
    // console.dir(sharedKeywords);

    let rawProcessed = rawData.map((r) => {
      // console.log(r.keywords);
      r.keywords = r.keywords
        ? r.keywords.filter((w) => sharedKeywords.includes(w))
        : []
      return r
    })

    // console.log("rawProcessed");
    // console.dir(rawProcessed);

    // NODE LIST
    const nodeList = rawProcessed.map((p) => {
      const imageUrl =
        p._type == "rawImage" || p._type == "rawVideo"
          ? urlForAnna(p.imageContent)
              .width(300)
              .quality(90)
              .auto("format")
              .url()
          : ""
      const fullImageUrl =
        p._type == "rawImage"
          ? urlForAnna(p.imageContent)
              .width(800)
              .quality(90)
              .auto("format")
              .url()
          : ""
      const obj = {
        data: {
          title: p.title,
          id: p._id,
          image: imageUrl,
          type: p._type,
          fullImage: fullImageUrl,
          text: p._type == "rawText" ? p.textContent : false,
          video: p._type == "rawVideo" ? p.videoUrl : false,
          keywords: p.keywords,
          source: p.sourceUrl,
        },
        classes: [kebabCase(p._type)],
      }
      // console.dir(obj);
      return obj
    })

    const nodesWithKeywords = nodeList.filter(
      (n) => n.data.keywords && n.data.keywords.length > 0
    )

    // console.log("nodesWithKeywords");
    // console.dir(nodesWithKeywords);

    let edgeList = []
    nodesWithKeywords.forEach((n) => {
      n.data.keywords.forEach((k) => {
        let targetNode = sample(
          nodesWithKeywords.filter(
            (x) => x.data.keywords.includes(k) && x.data.id !== n.data.id
          )
        )
        if (targetNode) {
          edgeList.push({
            data: {
              source: n.data.id,
              target: targetNode.data.id,
              keyword: k,
            },
          })
        }
      })
    })

    // console.log("edgelist");
    // console.dir(edgeList);

    cy = cytoscape({
      container: document.getElementById("graph"),
      boxSelectionEnabled: false,
      autounselectify: true,
      minZoom: 0.15,
      maxZoom: 6,
      autoungrabify: true,
      style: cytoscape
        .stylesheet()
        .selector("node")
        .css({
          "background-fit": "cover",
          "border-color": "#000",
          "border-width": 0,
          "border-opacity": 0,
          // "overlay-opacity": 0,
          opacity: 0,
        })
        .selector("edge")
        .css({
          "curve-style": "unbundled-bezier",
          width: 2,
          "line-gradient-stop-colors": "#0000FF #0000FF",
          "line-fill": "linear-gradient",
          // "overlay-opacity": 0,
          opacity: 0,
        })
        .selector(".raw-image")
        .css({
          "background-color": "#0000FF",
          "background-image": "data(image)",
          height: 120,
          width: 120,
          shape: "ellipse",
        })
        .selector(".raw-video")
        .css({
          shape: "rectangle",
          "background-image": "data(image)",
          height: 80,
          width: 120,
        })
        .selector(".raw-text")
        .css({
          shape: "rectangle",
          height: 120,
          width: 120,
        })
        .selector(".shown")
        .css({
          "line-gradient-stop-colors": "orange red",
          opacity: 0.8,
        }),
      // .selector(".shown:active")
      // .css({
      //   "overlay-opacity": 0.2
      // })
      // .selector(".shown:selected")
      // .css({
      //   "overlay-opacity": 0.2
      // }),

      elements: {
        nodes: nodesWithKeywords,
        edges: edgeList,
      },
      layout: {
        name: "cose",
        // name: "concentric",
        // name: "cola",
        animate: true,
        fit: false,
        zoom: 3,
        nodeOverlap: 2000,
        initialTemp: 10000,
        componentSpacing: 100,
        randomize: true,
        gravity: 10,
      },
    })

    cy.on("tap", "edge", (evt) => {
      const clickedEdgeId = evt.target.data().id
      const clickedEdgeEl = cy.$("#" + clickedEdgeId)
      if (clickedEdgeEl.hasClass("shown")) {
        edgeTerm = evt.target.data().keyword
        edgePopUpActive = true
        setTimeout(() => {
          edgePopUpActive = false
        }, 2000)
      }
    })

    cy.on("tap", "node", (evt) => {
      const clickedNodeId = evt.target.data().id
      const clickedNodeEl = cy.$("#" + clickedNodeId)

      if (clickedNodeEl.hasClass("active")) {
        popUpActive = false
        popUpTitle = false
        popUpText = false
        popUpImage = false
        popUpVideo = false
        popUpKeywords = []
        popUpSource = false

        const connectedEdges = edgeList.filter(
          (e) =>
            e.data.source == clickedNodeId || e.data.target == clickedNodeId
        )

        // console.log("&&&& – connectedEdges");
        // console.dir(connectedEdges);

        connectedEdges.forEach((selectedEdge) => {
          const newNodeId =
            selectedEdge.data.target == clickedNodeId
              ? selectedEdge.data.source
              : selectedEdge.data.target

          // console.log("&&&& – newNodeId");
          // console.dir(newNodeId);

          const newNodeEl = cy.$("#" + newNodeId)

          // console.log("&&&& – newNodeEl");
          // console.dir(newNodeEl);

          const selectedEdgeEl = cy.$("#" + selectedEdge.data.id)
          selectedEdgeEl.addClass("shown")

          if (!newNodeEl.hasClass("active")) {
            newNodeEl.animate(
              {
                style: { opacity: 1 },
              },
              {
                duration: 1000,
                easing: "ease-out-quad",
              }
            )
            newNodeEl.addClass("active")
          }
        })

        setTimeout(() => {
          popUpTitle = evt.target.data().title
          popUpText = evt.target.data().text
          popUpImage = evt.target.data().fullImage
          popUpVideo = evt.target.data().video
          popUpKeywords = evt.target.data().keywords
          popUpSource = evt.target.data().source
          popUpActive = true
        }, 500)

        cy.animate({
          center: {
            eles: clickedNodeEl,
          },
          duration: 800,
          easing: "ease-out-quad",
        })
      }
    })

    cy.on("layoutstop", (e) => {
      cy.nodes().panify()
      layoutLoaded = true

      let s = sample(cy.nodes())

      s.animate(
        {
          style: { opacity: 1 },
        },
        {
          duration: 1000,
          easing: "ease-out-quad",
        }
      )

      s.addClass("active")

      cy.animate({
        center: {
          eles: s,
        },
        duration: 1000,
        easing: "ease-out-quad",
      })
    })

    return rawProcessed
  })
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

    @include screen-size("small") {
      overflow-x: scroll;
    }
  }

  .pop-up {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 350px;
    min-height: 300px;
    background: rgba(244, 164, 96, 1);
    cursor: pointer;
    font-size: 14px;
    max-height: calc(100vh - 20px);
    overflow-y: auto;
    border-radius: 10px;
    z-index: 10001;
    padding: 10px;

    img,
    iframe {
      max-width: 100%;
      margin-bottom: 10px;
    }

    @include screen-size("small") {
      top: unset;
      bottom: 10px;
      width: calc(100% - 20px);
    }

    .gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 10px;
      width: 100%;
      background: linear-gradient(rgba(244, 164, 96, 1), rgba(244, 164, 96, 0));
    }

    .inner {
      background: red;
      position: relative;
      top: 100%;
      height: 100%;
      padding: 15px;
    }
  }

  .edge-pop-up {
    position: fixed;
    bottom: 10px;
    right: 10px;
    width: auto;
    background: rgba(222, 184, 135, 1);
    padding: 10px;
    color: black;
    cursor: pointer;
    font-weight: normal;
    font-size: 14px;

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
    font-size: 2px;

    &.loaded {
      opacity: 1;
    }
  }

  .divider {
    margin-right: 1ch;
  }

  .keyword {
    &:hover {
      text-decoration: underline;
    }
  }

  .source-link {
    border: 1px solid white;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 18px;
    float: right;

    &:hover {
      color: #dda794;
      background: white;
    }
  }

  .source-container {
    margin-top: 0.5em;
  }

  .title {
    margin-bottom: 0.5em;
  }

  .loading {
    position: fixed;
    top: 50%;
    left: 50%;
    font-weight: normal;
    color: rgb(105, 105, 245);
    transform: translateX(-50%) translateY(-50%);
    font-size: 16vw;
    animation: pulse 1s infinite alternate-reverse;
  }

  @keyframes pulse {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .iframe-container {
    overflow: hidden;
    // Calculated from the aspect ration of the content (in case of 16:9 it is 9/16= 0.5625)
    padding-top: 56.25%;
    position: relative;
    iframe {
      border: 0;
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }
  }
</style>

<svelte:head>
  <title>Anna Rún Tryggvadottir | LIQUID FICTION</title>
</svelte:head>

<div class="anna">
  {#if !layoutLoaded}
    <div class="loading">LOADING</div>
  {/if}

  <div id="graph" class="graph" class:loaded={layoutLoaded} />

  {#if popUpActive}
    <div
      class="pop-up"
      in:fade
      on:click={() => {
        popUpActive = false
      }}>
      <div class="title"><strong>{popUpTitle}</strong></div>
      {#if popUpImage}<img src={popUpImage} />{/if}
      {#if popUpText}
        <div>{popUpText}</div>
        <div class="gradient" />
      {/if}
      {#if popUpVideo}
        <div class="iframe-container">
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
        </div>
      {/if}
      {#each popUpKeywords as k, i}
        <a
          href={'https://www.google.fi/search?q=' + encodeURIComponent(k)}
          class="keyword"
          target="_blank">
          {k}
        </a>
        {#if i != popUpKeywords.length - 1}<span class="divider">/</span>{/if}
      {/each}
      {#if popUpSource}
        <div class="source-container">
          <a href={popUpSource} class="source-link" target="_blank">↳</a>
        </div>
      {/if}
    </div>
  {/if}

  {#if edgePopUpActive}
    <div
      class="edge-pop-up"
      out:fade
      on:click={() => {
        edgePopUpActive = false
      }}>
      <div>{edgeTerm}</div>
    </div>
  {/if}
</div>

<!-- <ErosionMachine /> -->
