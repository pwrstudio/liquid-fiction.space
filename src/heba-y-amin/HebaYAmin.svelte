<script>
  // # # # # # # # # # # # # #
  //
  //  HEBA Y AMIN
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import { fly, fade, scale } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { hebaClient, hebaRenderBlockText } from "../sanity.js";
  import flatMap from "lodash/flatMap";
  import filter from "lodash/filter";
  import random from "lodash/random";
  import Draggable from "draggable";

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

  let tagMap = {};
  let msg = "";
  let activeTweets = [];
  let stopTweets = false;
  let tweetsActive = false;
  // ** CONSTANTS
  const query = '*[]'
  let highZ = 100;

  async function loadData(query) {
    try {
      const res = await hebaClient.fetch(query);
      // console.dir(res);
      // console.dir(res.content.map(c => c.markDefs).filter(c => c.length > 0));

      console.dir(res);

      let content = res.find(p => p._type == "page");
      let tags = res.filter(p => p._type == "hashtag");
      console.dir(tags);

      tags.forEach(t => {
        tagMap[t._id] = t;
      });

      console.dir(tagMap);

      return content;
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
    }
  }

  const post = loadData(query);

  const showTweets = (tweets, i) => {
    tweets[i].top = random(10, window.innerHeight - 300);
    tweets[i].left = random(10, window.innerWidth - 370);
    activeTweets.push(tweets[i]);
    activeTweets = activeTweets;
    tweetsActive = true;
    setTimeout(() => {
      let element = document.getElementById(tweets[i]._key);
      new Draggable(element, {
        onDragEnd: el => {
          console.dir(el)
          el.style.zIndex = ++highZ;
          console.log(highZ)
        }
      });
    }, 100)
    setTimeout(() => {
      if (i < tweets.length - 1 && !stopTweets) {
        showTweets(tweets, ++i);
      }
    }, 500);
  };

  post.then(post => {
    setTimeout(() => {
      let hashtagElements = Array.from(document.querySelectorAll(".hashtag"));
      hashtagElements.forEach(ht => {
        ht.addEventListener("click", e => {
          activeTweets = [];
          stopTweets = false;
          showTweets(tagMap[ht.dataset.target].connectedContent, 0);
        });
      });
    }, 500);
  });
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
      max-width: calc(100% - 40px);
      font-family: "Times New Roman", Times, serif;
      font-size: 26px;
      margin-left: auto;
      margin-right: auto;
      padding-top: 80px;
      padding-bottom: 80px;

      @include screen-size("small") {
        font-size: 20px;
        padding-top: 120px;
      }
    }
  }

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

  .tweet {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 360px;
    background: lightgray;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 5px 5px 10px grey;
    cursor: move;
    user-select: none;
    touch-action: none;

    .close-tweet {
      position: absolute;
      top: 0px;
      right: 10px;
      font-size: 32px;
      cursor: pointer;
      transition: transform 0.2s ease-out;

      &:hover {
        transform: scale(1.1);
      }
    }

    .meta {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-size: 13px;

      .avatar {
        height: 48px;
        width: 48px;
        border-radius: 24px;
        margin-right: 10px;
        background: grey;
      }

      // .name {
      //   margin-right: 10px;
      // }

      .username {
        opacity: 0.6;
      }
    }

    .content {
      font-family: Helvetica, Arial, sans-serif;
      .text {
        font-size: 16px;
      }
    }

    .bottom {
      font-size: 11px;
    }
  }
</style>

<svelte:head>
  <title>Heba Y Amin | LIQUID FICTION</title>
</svelte:head>

<div class="heba">

  {#if activeTweets.length > 0}
    <div
      class="close"
      in:scale={{ delay: 600 }}
      out:scale
      on:click={e => {
        activeTweets = [];
        stopTweets = true;
        tweetsActive = false;
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
  {/if}

  {#await post then post}

    {#each activeTweets as t (t._key)}
      <div
        id={t._key}
        class="tweet"
        in:fade={{ duration: 200 }}
        out:scale
        style={'top: ' + t.top + 'px; left: ' + t.left + 'px;'}>

        <div
          class="close-tweet"
          on:click={e => {
            activeTweets = activeTweets.filter(a => a._key !== t._key);
          }}>
          ×
        </div>
        <div class="meta">
          <img src={t.avatar} class="avatar" />
          <span class="name">
            {t.author}
            <br />
            <span class="username">@{t.screenName}</span>
          </span>
        </div>
        <div class="content">
          <div class="text">{t.text}</div>
          <div class="image">
            <img src={t.image} />
          </div>
          <div class="bottom">
            <span class="date">{t.date}</span>
          </div>
        </div>
      </div>
    {/each}

    <div class="speech">
      {@html hebaRenderBlockText(post.content)}
    </div>
  {/await}

</div>

<!-- <ErosionMachine /> -->
