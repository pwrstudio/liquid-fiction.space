<script>
  // # # # # # # # # # # # # #
  //
  //  Spectrophilia
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { client, renderBlockText, urlFor } from "./sanity.js";
  import get from "lodash/get";
  import sample from "lodash/sample";
  import { fade } from "svelte/transition";

  const drapes = [
    "/img/drapes/1.png",
    "/img/drapes/2.png",
    "/img/drapes/3.png",
    "/img/drapes/4.png",
    "/img/drapes/5.png"
  ];

  // *** DOM REFS.
  let spectrophiliaEl = {};

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition,
    activePage,
    textContent
  } from "./stores.js";

  activePage.set("about");
  orbBackgroundOne.set("rgb(80, 80, 80)");
  orbBackgroundTwo.set("rgba(0,0,255,1)");

  orbColorTwo.set("rgba(255,255,255,1)");
  orbColorOne.set("rgba(255,255,255,1)");

  orbPosition.set({
    top: "10px",
    left: "10px"
  });

  const query = "*[ _type == 'spectrophilia'][0]";

  async function loadData(query, params) {
    try {
      const res = await client.fetch(query, params);
      return res;
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
    }
  }

  let spectrophilia = loadData(query, {});
  let pageIndex = 0;
</script>

<style lang="scss">
  @import "./variables.scss";

  .spectrophilia {
    font-family: "Courier New", Courier, monospace;
    font-size: 20px;
    height: 100vh;
    overflow-y: scroll;
    width: 100vw;
    background-image: linear-gradient(-90deg, #f5f7fa 0%, #c3cfe2 100%);
    color: black;

    @include screen-size("small") {
      font-size: 18px;
    }

    .page {
      width: 60ch;
      max-width: 90%;
      margin-left: auto;
      margin-right: auto;
      padding-top: 80px;
      padding-bottom: 80px;

      @include screen-size("small") {
        padding-top: 120px;
      }

      display: block;

      // &.shown {
      //   display: block;
      // }

      .background-image {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        object-fit: contain;
        object-position: center;
        pointer-events: none;
        z-index: 1;
        opacity: 0.25;
      }

      .inner {
        z-index: 10;
        position: relative;

        h2 {
          margin-top: 0;
        }

        .nav-container {
          width: 100%;
          padding-top: 40px;
          padding-bottom: 60px;

          .nav {
            background: rgba(160, 160, 160, 0.5);
            padding: 10px;
            width: auto;

            &.next {
              float: right;
            }

            &.prev {
              float: left;
            }

            cursor: pointer;

            &:hover {
              color: white;
              background: rgba(160, 160, 160, 1);
            }
          }
        }
      }
    }
  }
</style>

<svelte:head>
  <title>Spectrophilia | LIQUID FICTION</title>
</svelte:head>

<div class="spectrophilia" bind:this={spectrophiliaEl}>
  {#await spectrophilia then spectrophilia}
    {#each spectrophilia.content as page, i (page._key)}
      {#if i == pageIndex}
        <div class="page page-{i}-" in:fade>

          <!-- BACKGROUND IMAGE -->
          {#if i > 0}
            <img class="background-image" src={sample(drapes)} />
          {/if}

          <div class="inner">
            <!-- CONTENT -->
            {@html renderBlockText(page.content)}

            <!-- NAVIGATION -->
            <div class="nav-container">
              {#if pageIndex < spectrophilia.content.length - 1}
                <div
                  class="nav next"
                  on:click={e => {
                    pageIndex++;
                    spectrophiliaEl.scrollTo({ top: 0, left: 0 });
                  }}>
                  NEXT &#x3E;&#x3E;&#x3E;
                </div>
              {/if}
              {#if pageIndex > 0}
                <div
                  class="nav prev"
                  on:click={e => {
                    pageIndex--;
                    spectrophiliaEl.scrollTo({ top: 0, left: 0 });
                  }}>
                  &#x3C;&#x3C;&#x3C; PREVIOUS
                </div>
              {/if}
            </div>

            <!-- AUDIO -->
            {#if page.audio}
              <audio
                src={page.audio.asset._ref.includes('-wav') ? 'https://cdn.sanity.io/files/ylcal1e4/production/' + page.audio.asset._ref
                      .replace('file-', '')
                      .replace(
                        '-wav',
                        '.wav'
                      ) : 'https://cdn.sanity.io/files/ylcal1e4/production/' + page.audio.asset._ref
                      .replace('file-', '')
                      .replace('-mp3', '.mp3')}
                autoplay
                loop />
            {/if}
          </div>

        </div>
      {/if}
    {/each}
  {/await}
</div>
