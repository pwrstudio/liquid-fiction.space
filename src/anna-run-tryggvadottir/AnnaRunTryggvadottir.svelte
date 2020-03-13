<script>
  // # # # # # # # # # # # # #
  //
  //  ANNA RUN TRYGGVADOTTIR
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { annaClient, urlForAnna } from "../sanity.js";
  import getVideoId from "get-video-id";

  // *** COMPONENTS
  import ErosionMachine from "../eeefff/ErosionMachine.svelte";

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
      console.dir(res);
      return res;
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
    }
  }

  const raw = loadData(query);
</script>

<style lang="scss">
  @import "../_variables.scss";

  .anna {
    background: blue;
    min-height: 100vh;

    @include screen-size("small") {
      overflow-x: scroll;
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
</style>

<svelte:head>
  <title>Anna Rún Tryggvadottir | LIQUID FICTION</title>
</svelte:head>

<div class="anna">
  {#await raw then raw}
    {#each raw as post}
      <div class="post">
        {#if post._type == 'rawImage'}
          <img
            alt={post.metadata}
            src={urlForAnna(post.imageContent)
              .width(400)
              .quality(90)
              .auto('format')
              .url()} />
        {/if}
        {#if post._type == 'rawText'}
          <div>{post.textContent}</div>
        {/if}
        {#if post._type == 'rawVideo'}
          {#if post.videoUrl.includes('youtube')}
            <iframe
              width="480"
              height="320"
              title={post.metadata}
              src="https://www.youtube.com/embed/{getVideoId(post.videoUrl).id}"
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope;
              picture-in-picture"
              allowfullscreen />
          {/if}
          {#if post.videoUrl.includes('vimeo')}
            <iframe
              width="480"
              height="320"
              title={post.metadata}
              src="https://player.vimeo.com/video/{getVideoId(post.videoUrl).id}"
              frameborder="0"
              byline="false"
              color="#ffffff"
              allow="autoplay; fullscreen"
              allowfullscreen />
          {/if}
        {/if}
        {#if post.sourceText}
          <div class="source">
            {#if post.sourceUrl}
              <a href={post.sourceUrl} target="_blank">{post.sourceText}</a>
            {:else}
              <span>{post.sourceText}</span>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  {/await}
</div>

<!-- <ErosionMachine /> -->
