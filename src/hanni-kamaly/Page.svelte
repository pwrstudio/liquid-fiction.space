<script>
  // # # # # # # # # # # # # #
  //
  //  HANNI KAMALY: PAGE
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { hanniRenderBlockText } from "../sanity.js";
  import { fade, slide, fly, blur } from "svelte/transition";

  export let page = false;

  let currentHash = window.location.hash;

  const dispatch = createEventDispatcher();

  console.dir(page);

  const goToNext = () => {
    dispatch("next", {});
  };

  window.addEventListener(
    "hashchange",
    () => {
      currentHash = window.location.hash;
    },
    false
  );
</script>

<style lang="scss">
  @import "../_variables.scss";

  .hanni-kamaly-page {
    font-family: helvetica, arial, sans-serif;
    font-size: 24px;
    color: black;
    width: auto;
    width: 100%;
    height: auto;
    overflow-y: auto;
    padding: 10px;
    padding-top: 60px;
    padding-bottom: 120px;
    // border: 20px dashed rgba(190, 190, 190, 1);
    min-height: 100vh;
    z-index: 10;
    position: relative;

    @include screen-size("small") {
      padding-top: 120px;
      font-size: 20px;
      line-height: 1.4em;
    }
  }

  .hanni-kamaly-popup {
    font-family: helvetica, arial, sans-serif;
    font-size: 24px;
    background: lightgrey;
    background: rgba(255, 255, 0, 1);
    box-shadow: 0 10px 10px black;
    color: black;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow-y: auto;
    z-index: 10000;
    padding: 10px;
    padding-top: 80px;
    padding-bottom: 120px;

    @include screen-size("small") {
      padding-top: 120px;
      line-height: 1.4em;
      font-size: 20px;
    }
  }

  .skip {
    position: fixed;
    top: 45%;
    border: 0;
    color: black;
    padding: 0;
    outline: none;
    border-radius: 0;
    cursor: pointer;
    background: transparent;
    right: 10px;

    &:hover {
      color: lightgrey;
    }

    svg {
      height: 110px;
      width: 110px;
    }

    @include screen-size("small") {
      top: unset;
      bottom: 20px;
    }
  }
</style>

<div>

  <div
    class="hanni-kamaly-page"
    class:inactive={currentHash.length > 1}
    in:blur={{ duration: 1000 }}>

    {#if page.content}
      {@html hanniRenderBlockText(page.content)}
    {/if}

  </div>

  {#each page.content as content}
    {#if content.markDefs}
      {#each content.markDefs as mark}
        {#if mark._type == 'internalLink'}
          {#if currentHash == '#' + mark._key}
            <div class="hanni-kamaly-popup" id={mark._key}>
              {#if mark.content}
                {@html hanniRenderBlockText(mark.content)}
              {/if}
              <button class="skip" on:click={goToNext}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  class="feather feather-arrow-right">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <!-- <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  class="feather feather-fast-forward">
                  <polygon points="13 19 22 12 13 5 13 19" />
                  <polygon points="2 19 11 12 2 5 2 19" />
                </svg> -->
              </button>
            </div>
          {/if}
        {/if}
      {/each}
    {/if}
  {/each}

</div>
