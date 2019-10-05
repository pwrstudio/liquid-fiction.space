<script>
  // # # # # # # # # # # # # #
  //
  //  About
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  //   import intro from "./texts.js";
  import { fly, blur } from "svelte/transition";
  import { quartOut } from "svelte/easing";

  // *** VARIABLES

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    erosionMachineCounter,
    activePage
  } from "./stores.js";

  activePage.set("about");
  orbBackgroundOne.set("rgb(255, 140, 0)");
  orbBackgroundTwo.set("rgb(118, 165, 32)");

  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");
</script>

<style lang="scss">
  .text {
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    font-size: 18px;
    padding-bottom: 120px;
    font-weight: 300;
  }

  @keyframes sweep {
    0% {
      clip-path: inset(0% 0% 0% 100%);
      -webkit-clip-path: inset(0% 0% 0% 100%);
    }
    50% {
      clip-path: inset(0% 0% 0% 0%);
      -webkit-clip-path: inset(0% 0% 0% 0%);
    }
    100% {
      clip-path: inset(0% 100% 0% 0%);
      -webkit-clip-path: inset(0% 100% 0% 0%);
    }
  }

  @keyframes sweep-mobile {
    0% {
      clip-path: inset(0% 0% 100% 0%);
    }
    50% {
      clip-path: inset(0% 0% 0% 0%);
    }
    100% {
      clip-path: inset(100% 0% 0% 0%);
    }
  }

  #contain {
    height: 400px;
    width: 100vw;
    position: relative;
  }

  .logo2 {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 22vw;
    line-height: 150px;
    transform: translateX(-50%) translateY(-50%) scale(1);
  }

  .pane {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    font-weight: 200;
    cursor: pointer;
    background: darkgoldenrod;

    &.top-left {
      background: black;
      background: darkgoldenrod;
      color: goldenrod;
    }

    &.top-right {
      z-index: 10;
      background: darkorange;
      clip-path: inset(0% 0% 0% 100%);
      animation-name: sweep;
      animation-duration: 5s;
      animation-timing-function: easeOut;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      color: darkgoldenrod;

      @media only screen and (max-width: 700px) {
        animation-name: sweep-mobile;
        animation-duration: 7s;
        animation-timing-function: easeOut;
        animation-iteration-count: infinite;
        animation-direction: normal;
      }
    }
  }

  .about {
    min-height: 100vh;
    width: 100vw;
    background: darkorange;
    padding-top: 120px;
    padding-bottom: 300px;

    p,
    h1 {
      display: block;
      width: 70ch;
      max-width: 90vw;
      margin-right: auto;
      margin-left: auto;
      font-size: 22px;
      color: black;
      font-weight: 300;
      &.small {
        font-size: 16px;
      }
    }

    h1 {
      font-size: 90px;
      font-weight: 500;
    }
  }
</style>

<div class="about">

  <!-- {@html intro} -->

  <!-- <div in:fly={{ duration: 800, x: 60, delay: 0, easing: quartOut }}> -->
  <div in:blur>

    <p>
      <strong>LIQUID FICTION</strong>
    </p>

    <p>
      In the current state of melting modernity, humanity barely floats. Through
      mechanisms of constant resignification, language co-opts life itself.
      Narration is liquefied while the crumbling image of the nation state is
      contested by rising waters. Through an increasing tide of the ocean&#x27;s
      appearance in contemporary art projects, liquid fiction has come to
      encompass a changing social sphere. But although the waters are wet,
      drying might not be the solution. In the circular movement of the wave,
      neo-colonial regimes are contested by a circular dialectics of time. With
      the crest of the wave, a caesura follows, that inverts the perspective of
      what floats.
    </p>

    <p>
      &#x201C;It must nestle everywhere, settle everywhere, establish connexions
      everywhere.&#x201D; Karl Marx and Friedrich Engels used these words to
      describe the global market in the 1848 Communist Manifesto. Approaching
      two centuries later, they are still accurate: &#x201C;The need of a
      constantly expanding market for its products chases the bourgeoisie over
      the entire surface of the globe.&#x201D; The entire surface of the globe
      is covered by what Marx and Engels called &#x201C;fast-frozen
      relations&#x201D;, building up and melting, moving in a constant flux, but
      never settling down&#x2014;when all resources are gone, only time matters.
      In his book Liquid Modernity (2000), Zygmunt Bauman locates a permanent
      feature of modernity in &#x2018;melting solids&#x2019; - &#x201C;at the
      present time, the time of fluid modernity&#x201D;.
    </p>

    <p>
      Bauman&#x2019;s point derives from Marx&#x2019;s and Engels&#x2019; famous
      line &#x201C;all that is solid melts into air&#x201D;, used to describe
      the materiality of the constant machine of innovation. But what happens
      when the globe&#x2019;s surface decreases due to rising waters, when there
      is no more fluid matter to freeze and reshape? This is when we have to
      direct our gazes toward the oceans, as we once did toward the surfaces of
      neighboring planets. The waves of melting glaciers are continuously
      licking the shores of our continents, reminding us that the oceans are
      liquid by nature. Liquid modernity depends on these waters, just like the
      first civilizations once depended on rivers. Throughout the centuries,
      humans have transported goods and workforces, colonized land and dumped
      waste into the lungs of the earth. Today, it isn&#x2019;t only ice that
      melts. In a global market economy, the nation state itself is being
      liquidated. Currencies stream between multinational organizations and
      nationalist narratives float through disintegrating letters of wet paper.
    </p>

    <p>
      The movement of fluids and of the agile wave is a recurrent subject in art
      history: from The Great Wave off Kanagawa (1829-1833) by Katsushika
      Hokusai, to choreographer Isadora Duncan&#x2019;s modernist
      d&#xE9;tournement of dance practices in the early 1900s. As an alternative
      to solidifying historical canons in governing ballet tradition, she
      proposed a fluid movement technique, allowing the body to &#x201C;be in
      negotiations between the inner individual life and the outside
      (culture)&#x201D;, where the continuous movement of the wave symbolizes
      eternal life. Today, self-expression is renegotiated in terms of
      responsibility for the unspoken, and modernity&#x2019;s underwater
      currents are increasingly highlighted as alternatives to the vertical
      economy of the western state, the museological archive and the artistic
      canon. The horizontal movement of the oceans brings forth the circulatory
      logic of the wave. It never solidifies, it moves through persistence. We
      only have to listen, as American composer Annea Lockwood does. In her
      sound installation A Sound Map of the Danube (2005), she has collaged
      recordings from the shoreline of the river connecting central European
      countries. Arguing for sound&#x2019;s inherent relation with the vibrating
      fabric of human bodies, she underscores that the resonation of waves
      occurs both in our organs and in the flow of aging waters. Recording
      conversations with those who live alongside the river and fusing their
      voices with the river&#x2019;s sonic waves, Lockwood weaves a testimony of
      times, where personal fictions embody the nervous system of our earth
      today.
    </p>

    <p>
      In recent years, the ocean as phenomenon, as organism, has been
      increasingly actualized in art and theory. This is the point where the
      liquid fiction in arts coincides with the dead end of liquid modernity;
      manifest in the present crisis of the anthropocene. Having &#x201C;lost
      touch with the roots of [our] own modernity,&#x201D; we fight over
      narratives, over the roots and the very beginnings that made us come here
      in the first place. In 2018, French-Swiss artist Julian Charri&#xE8;re
      opened his solo exhibition &#x201C;As We Used to Float&#x201D; at the
      Berlinische Galerie, approaching the ocean from a top-down-perspective,
      captured by the artist&#x2019;s camera. The same year, visual artist and
      media scholar Tony Cokes presented his video work Mikrohaus, or the black
      atlantic? (2006&#x2013;8) at the 10th Berlin Biennale, connecting the
      black underground Detroit techno scene with perspectives from the bottom
      of the Atlantic. Another side of the coin was reflected by curator iLiana
      Fokianaki, in her 2018 exhibition &#x201C;Extra States: Nations in
      Liquidation&#x201D;, presented at Extra City Kunsthal. Putting the
      economic body of the nation state to the test, the exhibition invited
      artworks that rethought the constitution of such phenomena and its present
      crisis.
    </p>

    <p>
      We see the clear rise of liquid fictions in contemporary art, but they
      have been around for a while. The most prominent example is the myth of
      Black Atlantis: Drexciya. Populated by the children of pregnant slaves
      thrown overboard from slave ships crossing the Atlantic Ocean, who
      transitioned from amniotic fluid to ocean water and were able to survive
      at the bottom of the sea. Being populous enough to develop an underwater
      society, Drexciya is described as an alternative to the western hegemony
      of the land.
    </p>

    <p>
      In her essay Black Atlantis: Three Songs, artistic researcher Ayesha
      Hameed elaborates on the musicality of Drexciya, as formulated by the
      Detroit techno duo with the same name. With distant, static beats they
      proposed alternatives to the western Kraftwerk in the 80s. At the bottom
      of the sea, were the &#x201C;aquabahn&#x201D; drones. According to Hameed,
      the key aspect to the myth of Drexciya is &#x201C;its temporal
      proposition: to see time and history as equally in flux as the lapping
      ocean, to see the afterlife of the middle passage in a futuristic
      scenario&#x201D;. What is the temporal proposition that Hameed refers to?
      Let&#x2019;s turn back to the movement of the wave, described by Duncan as
      the movement between inner and outer life, through entanglement between
      present times, history, and the future. Today, &#x2018;now&#x2019; is a
      battleground, as the Invisible Committee write in their book Now (2017).
      They propose an engagement that doesn&#x2019;t rely on any historical
      explanation or future solution, but that depends only on actions in the
      present. Just like on the market, time is speculation. But, if the
      &#x2018;now&#x2019; is also what is to be occupied, this might have to be
      done with narratives that sustain liquefaction. And if all solidified
      narratives melt in flux, we need to construct alternatives that may endure
      such currents. What withstands the polarity of true and fake, and yet
      remains important for the present? Fiction does.
    </p>

    <p>
      Different from alterations of reality, fiction gives a name to what art
      historian Simon O&#x2019;Sullivan calls &#x201C;a-signifying
      signification&#x201D;, moving outside of signifying regimes. Such floating
      signifiers survive today&#x2019;s liquefaction of narration, that causes
      the crumbling states of nationalism, today encountered by rising populism.
      Fiction is, continues O&#x2019;Sullivan, a &#x201C;re-adjustment of the
      ever-so-slippery-relationship between propositions and things.&#x201D;
      Different from a streamlined capital production or the naming of the time
      that passes, fiction gives a name to the unnamable&#x2014;the only matter
      that is still left to extract. This might be why the post-truth has become
      so heavily debated in recent years. Just like a first resource in the
      beginning of the history of mankind, narration is also the last matter to
      capitalize in the ongoing outro of the anthropocene. But yet fiction is an
      important matter for mobilization, and that is why we have to turn back to
      the Black Atlantis. The waving posture of the world&#x2019;s heaviest body
      of water - the ocean itself - refuses white man&#x2019;s use of its
      surface. It reminds us that real breath needs to come from the very bottom
      of the lungs. Deep down there, a linear understanding of time and economy
      is contested, and a circular dialectics enables new aesthetics from the
      ocean&#x2019;s point of view.
    </p>

    <p>
      Just as the moon was once central for futurist aesthetics and national
      economies, the discursive fight for the water has just started. The
      &#x2018;performance&#x2019; of the ocean is in one way post-human, but yet
      so affected by human action. On the surface, humanity steps onto the stage
      in the middle of the wave&#x2019;s crumbling movement, and changes its
      direction. For each step, the previous actions melt in the white foam of
      the crest, and the contemporary crisis is performed on environmental,
      humanitarian and economical levels. Simultaneously the bottom of the sea
      remains still, as a recourse for prose and poetry without ends. Its slowly
      floating substances are not made to signify, rather, they embody the
      unnamed lives of the marginal. The children of the murdered slaves and the
      fish that were never included in the dictionary of fauna before they
      disappeared from it. It&#x2019;s no surprise that in Swedish media,
      anything that looks like an unknown submarine is still described as a
      Soviet &#x2018;threat&#x2019;, although the republic is long gone. When
      nations are liquidated, their ghosts continue to ambulate between the
      shores, as do old sailors who never reached the lighthouse. Simultaneously
      these shores are slowly melting into the ocean that carries both man,
      nation and ecology. The crisis is barely floating. At this stage, the
      liquefaction of capital is about to be liquidated.
    </p>

    <p>
      In Hito Steyerl&#x2019;s video work Liquidity Inc. (2014), the relation
      between liquid money (digital currency) and digital communication is
      elaborated on through the very aesthetics of new media. The
      &#x2018;Inc.&#x2019; in the title signifies floating corporations, making
      Bruce Lee&#x2019;s instruction to &#x201C;be water&#x201D; taste a little
      sour when pronounced. In an interview Steyerl argues for &#x201C;learning
      to ride out the waves (&#x2026;) instead of mindlessly heading into yet
      another un-survivable crash.&#x201D; The word &#x2018;crash&#x2019;
      applies to the market economy as well as the current of the wave bursting
      onto land, while software decomposes into myriads of black, cracked
      screens. Capitalism, argues Steyerl, feeds on &#x201C;ever-quicker
      successions of crisis (&#x2026;) The only ones breaking down are people
      and some other life forms. With accelerated crisis and permanent crashing,
      the rich get richer and the poor more sleepy, hungry and strained.&#x201D;
      Velocity is productive, she concludes. In SUPERFLEX&#x2019;s 2009 video
      Flooded McDonalds, the spectator follows close-up frames of a
      McDonald&#x2019;s restaurant, where water is slowly leaking in from under
      a door, calmly filling up the empty restaurant. From covering the floor,
      the water rises and starts to fill the space, furniture and loose paper
      drifting around alongside the human sized plastic figure of Ronald
      McDonald who also moves around in what seems like an abandoned water
      amusement park, fast food included.
    </p>

    <p>
      Let&#x2019;s now turn back to the famous phrase from the Communist
      Manifesto. If everything that is solid melts into air, does
      &#x201C;everything&#x201D; then only include bare life, floating
      signifiers in a flux of an economic gamble? If so, it is now clear that
      the fluid gamble is reshaped into a quest for the world&#x2019;s water
      resources. During the heatwave in the summer of 2018, the Swedish liberal
      think-tank Timbro proposed to privatize the public water resources in the
      country. Their proposal brought to mind the hydroelectric industry in the
      north of Sweden, where almost all rivers have been demolished by water
      banks&#x2014;just like the Mesopotamian ones once were in the fertile
      crescent. The power banks in northern Sweden are long-standing providers
      of electricity to the whole country, and especially the more populated,
      southern parts&#x2014;extracting and slowly depopulating the northern half
      of the country. In the recent Lule&#xE5; Biennale entitled &#x201C;Tidal
      Ground&#x201D; (2018-2019), the economic draining of natural resources was
      connected to ongoing military industry in the periphery of a global
      industry; such as the post-industrialized North.
    </p>

    <p>
      One participating artist in the biennale was the local Anja &#xD6;rn. In
      her sculpture and video work Till minnet av en &#xE4;lv (In Memorial of a
      River, 2018), images of the lost waves in the previously living river are
      recollected in the archive of the National Museum in Sweden, where the
      history of art and certainly painting, national romanticism, and the
      extraction and relocation of national resources, are linked together. In
      her artwork, &#xD6;rn has cast possible shapes of the previously painted
      waves in shiny metal. As paradoxical monuments of the lost, they remind us
      of their circular movements as opposites to a linear understanding of time
      and economy. In such circular dialectics, the crest of the wave enables an
      aesthetic autonomy from the moving water&#x2019;s point of view.
    </p>

    <p>
      These dialectics are also practiced in Heba Y. Amin&#x2019;s ongoing
      project Operation Sunken Sea &#x2013; Relocating the Mediterranean (2018 -
      ongoing). At a fictional meeting for what seems to be a UN assembly, Amin
      enacts the spokesperson of the Mediterranean Sea, presenting their plan to
      drain and relocate the water. &#x201C;The Mediterranean is not an
      ocean&#x201D;, Amin points out, when arguing for moving the sea in order
      to connect the two continents of Europe and Africa. As a consequence, the
      humanitarian crisis carried forth by the current constitution of land and
      water would be stopped, and in the long run; fascism too. Furthermore, she
      points out that international laws and unforeseeable ethics on land are
      constantly being ignored at sea. Walking on water seems to be granted only
      to Western man, whilst the sinking bodies continue to populate the deep
      blue. This is also highlighted by the artistic research project of
      Forensic Oceanography, mapping how southern European states guard their
      shorelines with an inverted panoptic logic, avoiding sinking boats as they
      cross the Mediterranean. Such dehumanization of lives is a central subject
      in many contemporary projects tackling urgent issues. The question that
      should be asked, is from which perspective the subject is approached. Who
      embodies the fiction, and who consumes to it? Re-locating the engine of
      the stigmatization of life itself, Heba Amin counteracts the source of
      colonial modernity as it is manifested today. In the liquefaction of
      language, everything flows. If time is unnamable, no words can change its
      course. Instead we have to close our eyes and listen. Eventually, all will
      be silent.
    </p>
    <p>Frida Sandstr&#xF6;m</p>
  </div>
</div>
