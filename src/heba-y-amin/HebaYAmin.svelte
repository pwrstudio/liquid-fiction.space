<script>
  // # # # # # # # # # # # # #
  //
  //  HEBA Y AMIN
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from 'svelte'
  import { fly, fade, scale } from 'svelte/transition'
  import { quartOut } from 'svelte/easing'
  import { hebaClient, hebaRenderBlockText } from '../sanity.js'
  import flatMap from 'lodash/flatMap'
  import filter from 'lodash/filter'
  import random from 'lodash/random'

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
    activePage,
  } from '../stores.js'

  activePage.set('heba')
  orbBackgroundOne.set('rgba(0,150,255,1)')
  orbBackgroundTwo.set('rgba(147,101,0,1)')

  orbColorOne.set('rgba(255,255,255,1)')
  orbColorTwo.set('rgba(0,0,0,1)')

  orbPosition.set({
    top: '10px',
    left: '10px',
  })

  let tagMap = {}
  let msg = ''
  let activeTweets = []
  let stopTweets = false

  // ** CONSTANTS
  const query = '*[]'

  async function loadData(query) {
    try {
      const res = await hebaClient.fetch(query)
      // console.dir(res);
      // console.dir(res.content.map(c => c.markDefs).filter(c => c.length > 0));

      console.dir(res)

      let content = res.find((p) => p._type == 'page')
      let tags = res.filter((p) => p._type == 'hashtag')
      console.dir(tags)

      tags.forEach(t => {
        tagMap[t._id] = t
      })

      console.dir(tagMap)
   
      return content
    } catch (err) {
      console.log(err)
      Sentry.captureException(err)
    }
  }

  const post = loadData(query)

  const showTweets = (tweets, i) => {
    tweets[i].top = random(10, window.innerHeight - 300)
    tweets[i].left = random(10, window.innerWidth - 370)
    activeTweets.push(tweets[i])
    activeTweets = activeTweets
    setTimeout(() => {
      if(i < (tweets.length - 1) && !stopTweets) {
        showTweets(tweets, ++i)
      }
    }, 1000)
  }

  post.then(post => {
    setTimeout(() => {
        let hashtagElements = Array.from(document.querySelectorAll('.hashtag'))
          hashtagElements.forEach(ht => {
            // ht.addEventListener('mouseenter', e => {
            //   activeTweets = []
            //   stopTweets = false
            //   showTweets(tagMap[ht.dataset.target].connectedContent, 0)
            // })
            ht.addEventListener('click', e => {
              activeTweets = []
              stopTweets = false
              showTweets(tagMap[ht.dataset.target].connectedContent, 0)
            })
          })
      }, 500)
  })
</script>

<style lang="scss">
  @import '../_variables.scss';

  .heba {
    color: black;
    background: azure;
    min-height: 100vh;

    @include screen-size('small') {
      overflow-x: scroll;
    }

    .speech {
      color: black;
      width: 70ch;
      max-width: 100%;
      font-family: 'Times New Roman', Times, serif;
      font-size: 26px;
      margin-left: auto;
      margin-right: auto;
      padding-top: 80px;
      padding-bottom: 80px;
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
    cursor: pointer;

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

  {#await post then post}

   {#each activeTweets as t (t._key)}
      <div class="tweet" in:fade={{duration: 300}} out:scale style={'top: ' + t.top + 'px; left: ' + t.left + 'px;'} on:click={e=>{activeTweets=[];stopTweets=true;}}>
        <div class="meta">
          <img src={t.avatar} class='avatar'/>
          <span class='name'>{t.author}<br/>
            <span class='username'>@{t.screenName}</span>
          </span>
        </div>
        <div class='content'>
          <div class='text'>
            {t.text}
          </div>
          <div class='image'>
            <img src={t.image}/>
          </div>
          <div class="bottom">
            <span class='date'>{t.date}</span>
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
