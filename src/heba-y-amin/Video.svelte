<script>
  // # # # # # # # # # # # # #
  //
  //  VIDEO
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import getVideoId from "get-video-id"
  import { fade, scale } from "svelte/transition"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  // PROPS
  export let url = {}
</script>

<style lang="scss">
  @import "../_variables.scss";

  .close {
    position: fixed;
    top: 20px;
    right: 40px;
    color: black;
    height: 50px;
    width: 50px;
    z-index: 1000;
    cursor: pointer;
    transition: transform 0.3s ease-out;

    &:hover {
      transform: scale(1.2);
    }
  }

  .container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 150, 255, 0.5);
  }

  .embed {
    display: block;
    width: 720px;
    max-width: 95%;
    padding: 40px;
    background: rgba(0, 150, 255, 1);

    @include screen-size("small") {
      padding: 20px;
      margin: 0;
    }

    .youtube-container,
    .vimeo-container {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      max-width: 720px;
      width: 100%;
      margin-bottom: 0.5em;

      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
    }
  }
</style>

<div
  class="close"
  in:scale={{ delay: 600 }}
  out:scale
  on:click={(e) => {
    dispatch('close')
  }}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55.46 55.39">
    <path
      d="M1.04 48.35a3.91 3.91 0 00-1 2.4 3.08 3.08 0 001 2.41l1.23
          1.23a3.37 3.37 0 002.34.96 3.12 3.12 0 002.47-.89L26.3 34.94a1.55 1.55
          0 012.47 0l19.49 19.35a3 3 0 002.33 1.06 3.37 3.37 0
          002.47-1.1l1.38-1.23a2.88 2.88 0 001-2.4 3.62 3.62 0 00-1-2.41L34.92
          28.76a1.55 1.55 0 010-2.47L54.44 7.07a3.18 3.18 0 00.89-2.47 3.45 3.45
          0 00-.89-2.33L53.2 1.03a3.2 3.2 0 00-2.47-1 3.44 3.44 0 00-2.33
          1L28.92 20.25a1.4 1.4 0 01-2.33 0L7.08 1.03a2.84 2.84 0 00-2.27-1 3.51
          3.51 0 00-2.54 1.1L1.04 2.27a3.21 3.21 0 00-1 2.54 3.48 3.48 0 001
          2.4l19.22 19.36a1.66 1.66 0 010 2.47z" />
  </svg>
</div>
<div class="container" in:fade>
  <figure class="embed">
    <!-- // YOUTUBE -->
    {#if url.includes('youtube')}
      <div class="youtube-container">
        <iframe
          width="720"
          height="480"
          src={'https://www.youtube.com/embed/' + getVideoId(url).id}
          frameborder="no"
          allow="autoplay; fullscreen"
          allowfullscreen />
      </div>
    {/if}

    <!-- // VIMEO -->
    {#if url.includes('vimeo')}
      <div class="vimeo-container">
        <iframe
          width="720"
          height="480"
          src={'https://player.vimeo.com/video/' + getVideoId(url).id}
          frameborder="no"
          scrolling="no"
          byline="false"
          color="#ffffff"
          allow="autoplay; fullscreen"
          allowfullscreen />
      </div>
    {/if}
  </figure>
</div>
