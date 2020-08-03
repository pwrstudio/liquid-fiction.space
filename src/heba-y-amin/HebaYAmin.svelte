<script>
  // # # # # # # # # # # # # #
  //
  //  HEBA Y AMIN
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { hebaClient, hebaRenderBlockText } from "../sanity.js";
  import flatMap from "lodash/flatMap";
  import filter from "lodash/filter";

  // *** COMPONENTS
  // import ErosionMachine from "../eeefff/ErosionMachine.svelte";

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

  activePage.set("heba");
  orbBackgroundOne.set("rgba(0,150,255,1)");
  orbBackgroundTwo.set("rgba(147,101,0,1)");

  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");

  orbPosition.set({
    top: "10px",
    left: "10px"
  });

  let tagsResponse = [];

  // ** CONSTANTS
  const query = "*[ _type == 'page'][0]";

  async function loadData(query) {
    try {
      const res = await hebaClient.fetch(query);
      // console.dir(res);
      // console.dir(res.content.map(c => c.markDefs).filter(c => c.length > 0));
      let tags = filter(
        flatMap(res.content, c => c.markDefs),
        x => x._type === "hashTag"
      );
      // console.dir(tags);
      const rawResponse = await fetch(
        "https://cycle-2--liquid-fiction-dev.netlify.app/.netlify/functions/twitter",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(tags)
        }
      );
      tagsResponse = await rawResponse.json();
      // console.dir(tagsResponse);
      return res;
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
    }
  }

  const post = loadData(query);
</script>

<style lang="scss">
  @import "../_variables.scss";

  .heba {
    color: black;
    background: azure;
    min-height: 100vh;

    @include screen-size("small") {
      overflow-x: scroll;
    }

    .speech {
      color: black;
      width: 70ch;
      max-width: 100%;
      font-family: "Times New Roman", Times, serif;
      font-size: 26px;
      margin-left: auto;
      margin-right: auto;
      padding-top: 80px;
      padding-bottom: 80px;
    }
  }

  .tags {
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;

    .tweet {
      bortder-bottom: 1px solid black;
    }
  }
</style>

<svelte:head>
  <title>Heba Y Amin | LIQUID FICTION</title>
</svelte:head>

<div class="heba">

  {#await post then post}

    {#each tagsResponse as t}
      <div class="tags">
        <h2>{t.tag}</h2>
        {#if t.tweets && t.tweets.statuses && t.tweets.statuses.length > 0}
          {#each t.tweets.statuses as tweet}
            <div class="tweet">
              <div class="date">{tweet.created_at}</div>
              <div class="text">{tweet.text}</div>
            </div>
          {/each}
        {/if}
      </div>
    {/each}

    <div class="speech">
      {@html hebaRenderBlockText(post.content)}
    </div>
  {/await}

</div>

<!-- <ErosionMachine /> -->
