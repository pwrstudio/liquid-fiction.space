<script>
  // # # # # # # # # # # # # #
  //
  //  HANNI KAMALY: PAGE
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { hanniRenderBlockText } from "../sanity.js";
  import { fade } from "svelte/transition";

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
    background: white;
    color: black;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 500px;
    max-width: 95vw;
    height: 80vh;
    overflow-y: auto;
    padding: 10px;

    &.inactive {
      pointer-events: none;
      opacity: 0.5;
    }
  }

  .next {
    float: right;
    border: 0;
    font-size: 32px;
    background: blue;
    color: white;
    padding: 10px;
    outline: none;
    border-radius: 0;
    width: 200px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .hanni-kamaly-popup {
    background: rgba(230, 230, 230, 0.9);
    box-shadow: 0 10px 10px black;
    color: black;
    position: fixed;
    top: 40%;
    left: 60%;
    transform: translateX(-50%) translateY(-40%);
    width: 500px;
    max-width: 95vw;
    height: 80vh;
    overflow-y: auto;
    padding: 10px;
  }
</style>

<div>

  <div class="hanni-kamaly-page" class:inactive={currentHash.length > 1}>
    <h1>{page.title}</h1>
    {#if page.content}
      {@html hanniRenderBlockText(page.content)}
    {/if}
    <button class="next" on:click={goToNext}>></button>

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
              <button class="next" on:click={goToNext}>></button>
            </div>
          {/if}
        {/if}
      {/each}
    {/if}
  {/each}

</div>
