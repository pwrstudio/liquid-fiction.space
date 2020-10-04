<script>
  // # # # # # # # # # # # # #
  //
  //  HANNI KAMALY
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { hanniClient } from "../sanity.js"
  import get from "lodash/get"

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
  const query = "*[ _id == 'meta'][0]"

  activePage.set("hanni")
  orbBackgroundOne.set("rgba(244,255,0,1)")
  orbBackgroundTwo.set("rgba(255,255,255,1)")

  orbColorOne.set("rgba(0,0,0,1)")
  orbColorTwo.set("rgba(0,0,0,1)")

  orbPosition.set({
    top: "10px",
    left: "10px",
  })

  let downloadUrl = ""

  async function loadData(query, params) {
    try {
      const res = await hanniClient.fetch(query, params)
      return res
    } catch (err) {
      console.log(err)
      Sentry.captureException(err)
    }
  }

  const makeUrl = (ref) => {
    const stripped = ref.substring(5).replace("-", ".")
    return "https://cdn.sanity.io/files/em610obk/production/" + stripped
  }

  const meta = loadData(query)

  meta.then((meta) => {
    downloadUrl = makeUrl(get(meta, "downloadFile.asset._ref", ""))
  })
</script>

<style lang="scss">
  @import "../_variables.scss";

  .hanni {
    background: white;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 50px;
    }

    @include screen-size("small") {
      overflow-x: scroll;
    }
  }
</style>

<svelte:head>
  <title>Hanni Kamaly | LIQUID FICTION</title>
</svelte:head>

<div class="hanni">
  {#await meta then meta}
    <a href={downloadUrl} download target="_blank">
      <img src="/img/pdf.svg" />
    </a>
  {/await}
</div>

<!-- <ErosionMachine /> -->
