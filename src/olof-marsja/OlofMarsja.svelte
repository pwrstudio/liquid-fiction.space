<script>
  // # # # # # # # # # # # # #
  //
  //  EEEFFF
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import Sketchfab from "@sketchfab/viewer-api";
  import { tns } from "../../node_modules/tiny-slider/src/tiny-slider";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";

  // *** STORES
  import {
    menuActive,
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo
  } from "../stores.js";

  orbBackgroundOne.set("rgba(128,25,55,1)");
  orbBackgroundTwo.set("rgba(145,100,127,1)");

  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");

  let iframeEl = {};
  let iSlideEl = {};
  let loaded = false;
  let sketchFabClient = {};
  let slider = {};

  // $: {
  //   if ($menuActive) {
  //     slider.pause();
  //   } else if (slider.play) {
  //     console.log(slider);
  //     slider.play();
  //   }
  // }

  const iArray = [
    "IWake",
    "ICome",
    "ISee",
    "ICry",
    "IHear",
    "ISuck",
    "IEat",
    "ISubmitt",
    "ICrawl",
    "ISnuggle",
    "ILaugh",
    "ISit",
    "IBalance",
    "IGrab",
    "IWalk",
    "IScream",
    "ICuddle",
    "ILook",
    "ITake",
    "ICarry",
    "IShit",
    "IFeed",
    "IRoam",
    "IDrive",
    "IPour",
    "ICast",
    "ISolidify",
    "",
    "",
    "ISurf",
    "",
    "ICarve",
    "IMold",
    "IDigitalize",
    "IChange",
    "ITalk",
    "IBomb",
    "IPaint",
    "IBuild",
    "IDestroy",
    "IDress",
    "",
    "IWould",
    "",
    "ICook",
    "IPee",
    "IProtect",
    "IRemember",
    "IFinish",
    "ISwear",
    "",
    "",
    "IConnect",
    "ICompute",
    "IRun",
    "IBike",
    "ISmash",
    "IDraw",
    "ISew",
    "IWeld",
    "IHammer",
    "",
    "ISwim",
    "IPass",
    "IStop",
    "IThink",
    "IScrew",
    "IClay",
    "IBurn",
    "IHeat",
    "IDraught",
    "IBuy",
    "ICapitalise",
    "IBurry",
    "IMarry",
    "IDie",
    "IBorn",
    "IBust",
    "IAruge",
    "IDefend",
    "IAm",
    "IDevalue",
    "IForgett",
    "IDisappear",
    "IVanish",
    "",
    "IBlow",
    "",
    "IManage",
    "IBuild",
    "ILinger",
    "IToss",
    "I",
    "",
    "IWish",
    "IDo",
    "IBehave",
    "ISuffer",
    "IPray",
    "IKick",
    "IListen",
    "IWrite",
    "IKnit",
    "IPonder",
    "ISlaughter",
    "IBring",
    "IMark",
    "ISeparate",
    "I",
    "I",
    "I",
    "I",
    "I",
    "I",
    "I",
    "I",
    "",
    "IVoid",
    "INail",
    "IKnife",
    "ILeaf",
    "IStone",
    "IPad",
    "ISand",
    "IPhone",
    "IMug",
    "IWater",
    "ISlab",
    "IWood",
    "IApple",
    "IOrange",
    "IMac",
    "",
    "IPillar",
    "IHouse",
    "ITent",
    "IHut",
    "ISkyskrape",
    "ICastle",
    "IBin",
    "I",
    "I",
    "I",
    "I",
    "I",
    "I",
    "I",
    "I",
    "I",
    "I"
  ];

  onMount(async () => {
    slider = tns({
      container: iSlideEl,
      items: 1,
      axis: "vertical",
      speed: 600,
      controls: false,
      nav: false,
      autoplay: true,
      mouseDrag: false,
      touch: false,
      autoplayTimeout: 2000,
      autoplayButtonOutput: false,
      autoplayText: false
    });

    slider.events.on("indexChanged", i => {
      if (!$menuActive) {
        try {
          let msg = new SpeechSynthesisUtterance(
            iArray[slider.getInfo().index - 1]
          );
          window.speechSynthesis.speak(msg);
        } catch (err) {
          console.error("💥 Speech synthesis error:", err);
        }
      }
    });

    let uid = "2bb57385c8df4e9bbe487a4be328a9a9";
    sketchFabClient = new Sketchfab(iframeEl);
    sketchFabClient.init(uid, {
      autospin: 0.1,
      autostart: 1,
      success: function onSuccess(api) {
        api.start();
        api.addEventListener("viewerready", function() {
          loaded = true;
        });
      },
      error: function onError(err) {
        console.error("💥Viewer error", err);
      }
    });
  });

  onDestroy(async () => {
    iframeEl.remove();
    slider.destroy();
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .olof {
    background: blue;
    min-height: 100vh;
  }

  .plate-1 {
    position: fixed;
    left: 10px;
    top: 10vh;
    height: 80vh;

    .inner {
      position: relative;
      height: 100%;
      width: 100%;

      .text {
        color: black;
        height: 71%;
        width: 76%;
        position: absolute;
        left: 12%;
        top: 16%;
        overflow: hidden;
        font-size: 18px;
        font-family: arial;
        // background: rgba(255, 0, 0, 0.4);
        white-space: pre-line;
        overflow-y: scroll;
        padding-left: 5px;
        padding-top: 5px;
      }

      img {
        height: 100%;
      }
    }
  }

  .rock {
    position: fixed;
    right: 10px;
    top: 10vh;
    height: 80vh;

    .inner {
      position: relative;
      height: 100%;
      width: 100%;

      .text {
        color: black;
        height: 50%;
        width: 44%;
        position: absolute;
        left: 35%;
        top: 30%;
        overflow: hidden;
        font-size: 22px;
        font-family: arial;
      }

      img {
        height: 100%;
      }
    }
  }

  .slipa {
    position: fixed;
    top: 10px;
    left: 50%;
    width: 400px;
    margin-left: -200px;
  }

  iframe {
    width: 120vw;
    height: 120vh;
    position: fixed;
    top: -10vh;
    left: -10vw;

    opacity: 0;
    transition: opacity 1s ease-out;

    &.loaded {
      opacity: 1;
    }
  }
</style>

<svelte:head>
  <title>Olof Marsja | LIQUID FICTION</title>
</svelte:head>

<div class="olof">

  <div in:fly={{ duration: 800, x: 60, delay: 0, easing: quartOut }}>

    <iframe
      alt="Olof Marsja"
      title="Olof Marsja"
      class:loaded
      src=""
      id="api-frame"
      allow="autoplay; fullscreen; vr"
      allowvr
      allowfullscreen
      mozallowfullscreen="true"
      webkitallowfullscreen="true"
      bind:this={iframeEl} />

    <!-- <video src="/img/hacka.mp4" autoplay muted loop /> -->
    <video class="slipa" src="/img/s2.mp4" autoplay muted loop />

    <div class="rock">
      <div class="inner">
        <img src="/img/Rock.png" alt="Olof Marsja - Rock" />
        <div class="text">
          <div bind:this={iSlideEl}>
            {#each iArray as iTem}
              <div>{iTem}</div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <div class="plate-1">
      <div class="inner">
        <img src="/img/plate1.png" alt="Olof Marsja - Plate 1" />
        <div class="text">
          Hola Olof
          <br />
          THIS JUST IN &#x2014;
          <br />
          Former favourite frequency of the world, commonly known as #love, is
          struggling to find outlets for expression!
          <br />
          WHAT?
          <br />
          I know.
          <br />
          Due to the steady increase of human interest in drama and distraction
          &#x2013; globally &#x2013; #love is officially at risk of not being
          commonly felt.
          <br />
          Brace yourself ladies and gentlemen, #love is officially an Endangered
          Frequency!
          <br />
          As most people are aware, the Emotional/Energetic StockMarket is
          teaming with options! Love, joy, creativity, patience, chill and
          kindness are most certainly some tasty favourites. There are also some
          spicier vibes up for investment such as frustration, anger, doubt,
          apathy and the ever increasing popular vibe &#x2013; #fear.
          <br />
          #Fear&#x2019;s marketing campaign is something to behold. Catching the
          attention of millions and millions of attention investors, it has
          literally swept through the Mental Atmosphere of humanity &#x2013;
          like a virus.
          <br />
          Passed around Via Us.
          <br />
          It is a radical thought, that #fear gets up to 80% more airtime than
          any other vibe?
          <br />
          So what of these nourishing vibes that are no longer so popular?
          <br />
          Do they just have weak marketing? Bad branding? Not enough likes and
          followers?
          <br />
          A few weeks ago it was announced, the most recent vibe to join the
          endangered frequency list was #freedom.
          <br />
          WHAT?!!!!!
          <br />
          Of all the things to go out of fashion? FREEDOM!!! But how can it
          happen?
          <br />
          According to NOW NiNJAs all over the world, it has been a very sneaky
          series of events, #limitation and #restriction have been parading
          around like law and order &#x2013; creating the illusion that more
          rules are cool &#x2013; and we need more and more of them. So, rules
          are on the rise, yet little do people know that many of them are
          funded by #limitation and #fear.
          <br />
          The status of #trust is being watched VERY carefully. It seems that
          the deeply rich imagination of a hand full of dreamers in this world,
          is still holding #trust in it&#x2019;s fundamental place&#x2026; but
          who knows for how long&#x2026;
          <br />
          Reports are coming in from all over NowHere, that some of our classic
          good vibes &#x2013; are missing.
          <br />
          Think about it for a moment, are there some feelings you miss feeling?
          Are your best emotions only active as memories? Well, you are not
          alone.
          <br />
          It&#x2019;s not just you, this has become our global energetic
          culture. It is more common for people to feel concern or anxious than
          they are to feel inspired and powerful.
          <br />
          Which brings us to the Present Moment.
          <br />
          The NOW needs you! For conscious participation in the Present Moment!
          <br />
          Are you ready to play the GAME?!!!
          <br />
          <br />
          Hola Olof
          <br />
          Getting bombarded in you inbox is one thing, but getting bombarded in
          your mind is another!
          <br />
          In this &#x27;high-tech, low touch&#x27; time we REALLY have to filter
          what we let in...
          <br />
          What we let in &#x2013; reflects what we &#x27;put out&#x27;. And the
          essence of what we put out &#x2013; determines what comes back in.
          <br />
          Oh! What a sneaky little circle!
          <br />
          The sheer volume of information is an avalanche on your awareness!!
          Scrolling, clicking, watching and listening. Every iota of information
          generates a thought and feeling from you. We are speeding up, scanning
          and spamming, letting more in...
          <br />
          Thanks for your precious attention.
          <br />
          #legit.
          <br />
          The wrong advertisements in your awareness can shorten your attention
          span!
          <br />
          &#x26A0;&#xFE0F; Not to mention turn you into a momenterrorist!
          &#x26A0;&#xFE0F;
          <br />
          Quality control is the order of the day!
          <br />
          Looking at this epidemic, I put my NOW NiNJA jumpsuit on and came up
          with a genius way to sneak up on your awareness....
          <br />
          <br />
          Hola Olof
          <br />
          Two of the biggest challenges that individuals have with holding a new
          vision for their lives is:
          <br />
          #1. Forgetting to do it. (We are just too busy!)
          <br />
          #2. Struggling to feel and think beyond who they are in this moment.
          <br />
          It makes sense that it is challenging, after all, you are VERY good at
          being this version of you. You&#x27;ve been in this role for what? 20,
          30, 40, 50 years?!!
          <br />
          No wonder it can feel so hard to change!!
          <br />
          We are mostly a collection of habits!
          <br />
          Change takes practice. Persistence. Courage. You have to catch
          yourself out in the NOWness of a moment and load and code your new
          program &#x2013; on the spot.
          <br />
          You&#x27;ve got to turn up at rehearsal and learn the new script.
          <br />
          You have practice a new posture and exude a new vibe.
          <br />
          You have to practice complete emotional investment to become a new
          identity
          <br />
          AND
          <br />
          you have to start right from where you are, in the life that you have
          &#x2013; with the habits that you currently have.
          <br />
          Do you have a plan? Whatcha going to do NOW, NiNJA?! 5,6,7,8!!!
          <br />
          <br />
          Hola Olof!!!
          <br />
          LiFE!! What a Game! We count down to the NOW! and then we launch
          ourselves, victoriously, into the new NOW, with a few more layers,
          lessons and desires and hopefully a few less layers of worry and fear!
          Some of us are hungry, eagerly wanting to become more of ourselves.
          Some of us are wanting last year to disappear as quickly as possible,
          because the pain of that chapter was too much to bare. Wherever you
          are on the spectrum of vibes, I hope we can meet in the middle of
          <br />
          &#x2013;&#x2013;&#x2013;&#x2013;&#x2013;&#x2013;&#x2013;&#x2013;&#x3E;&#x3E;&#x3E;
          THiS
          &#x3C;&#x3C;&#x3C;&#x2013;&#x2013;&#x2013;&#x2013;&#x2013;&#x2013;&#x2013;&#x2013;
          moment
          <br />
          understanding that life is but a stream of elegant instants, and ALL
          moments are created equal! The Game of Life rolls on.
          <br />
          Rumour has is it &#x2013; the ebb and flow of 3D life is not for the
          faint hearted. Duality is in fact quite an emotional war zone! But as
          you look back into 2018 &#x2013; at what happened, who happened, the
          plot twists, the connections, the break ups, the breakthroughs, I
          trust you will find a way to
          &#x2013;&#x2013;&#x2013;&#x3E;&#x3E;&#x3E; rest
          &#x3C;&#x3C;&#x3C;&#x2013;&#x2013;&#x2013; in your mighty unfolding.
          <br />
          NiNJA yo self into the NOW!
          <br />
          Let yourself off the hook! And while you are at it&#x2026; stretch
          yourself a little further, because I have a sneaking suspicion that
          eternity is a long time and that THiS moment (in particular) REALLY
          counts! Here&#x2019;s to a mighty 2019! And here&#x2019;s to a
          deepening devotion to creating quality moments.
          <br />
          THERE IS SO MUCH GOODNESS GOING ON IN THIS WORLD! Thanks for being a
          part of the answer Olof &#x3C;3
          <br />
          Hola Olof!!
          <br />
          How can I stay positive and inspired in negative environments? THIS is
          one of my favourite questions of All Time! AND it becomes more and
          more relevant during this incredible time in human history! Staying
          inspired and plugged into your potential is the ultimate quest in Time
          and Space.
          <br />
          Not only do we have to find ways to dodge the damage, we want to
          strengthen our focus, be solution orientated, and represent the
          possibilities during this incredible time!
          <br />
          Yet shortly after leaving the comfort of your own NOW LAB, the battle
          begins. The sheer onslaught of negative messaging is coming right at
          ya!
          <br />
          Yet... YOU are the HERO in this story! SO, how are you going to stay
          awake NOW, NiNJA&#x2026;? Especially when you are surrounded by those
          intense &#x2018;momenterrorists!&#x2019; I trust this vid will remind
          you to find creative ways to stay on the path.
          &#x1F3FD;&#x2B50;&#xFE0F;
          <br />
          <br />
          Hey there Olof Do you ever get a sense, that something is trying to
          happen through you? Like there is something giant in you; a gift, a
          talent, a capacity!
          <br />
          Whatever it is, it scares the wits out of you &#x2013; because you
          have no idea of HOW to get from where you are right now, to living
          that life of #creativity, #freedom, #service and #abundance! In fact,
          it looks perfectly impossible.
          <br />
          But you and I know, even though this dream goes against all your logic
          and reasoning, it has somehow hit you deep in the NOW ;)
          <br />
          And it just won&#x27;t &#x2013; go &#x2013; away.
          <br />
          So whether you are tormented by a vision, or you are yet to really
          uncover and discover your &#x27;thing&#x27;....
          <br />
          NOW is the time to start asking yourself &#x2013; some radically
          different questions.
          <br />
          I can help you do just that.
          <br />
          <br />
          Hola Olof
          <br />
          Do you feel your Divine Assignment? Do you wake up everyday, ready to
          hear the intuitive marching orders from the Intelligence of Source?
          <br />
          With so much distraction coming in from everywhere, what does it take
          to be the hero in your own story?
          <br />
          Here is a summary of the task at hand, with love from....
          <br />
          &#x9; &#x9;&#x9;&#x9; &#x9;&#x9;&#x9;&#x9; Sometimes your own
          &#x27;momenterrorism&#x27; can be so bad you actually believe
          everything is working against you. You envision your happiness gagged
          and bound; being held ransom by some invisible power in the
          universe!!!
          <br />
          Wrong.
          <br />
          R.O.N.G. :)
          <br />
          Wrong.
          <br />
          Your happiness is NOT being held ransom by an all powerful
          somethin&#x27;-or-other. The only thing lording over you is &#x2013;
          your own stagnated perception. AKA: resistance.
          <br />
          Argh! Really?
          <br />
          I know, it&#x27;s an anti-climax to reality.
          <br />
          Lucky for you, you can just get out of the way and let it flow.
          <br />
          HOW?
          <br />
          1. Be# willing. Willingness will get you every where these days ;)
          <br />
          2. Take your Vow to NOW &#x2013; make this decision important!! Make
          (the quality of) your life depend on it! I&#x27;m talking about a real
          promise to bring a high quality participation to the present moment.
          <br />
          3. Develop some NOWism strategies to take care of your
          &#x27;momenterrorists&#x27; when they arise to hi-jack your mind. Try
          the NOWism FREE Mini Course &#x3E;&#x3E;&#x3E; NEOS &#x3C;&#x3C;&#x3C;
          if you haven&#x27;t already! (That is a FREE download.)
          <br />
          You&#x27;re welcome&#x2026;
          <br />
          Hola Olof!
          <br />
          WARNING! Humans can whinge about the most insignificant things! The
          ego goes on a rampage, feeling entitled to more, more, MORE!
          <br />
          Meanwhile (in reality), infinite gifts have already been given!
          <br />
          NOW NiNJA response:
          <br />
          Get out your cosmic cheque book.... and write yourself a little
          reminder.
          <br />
          STOP! Stand still and let the love in!
          <br />
          Deflecting compliments is a disempowering energetic posture. It is
          like refusing a most generous gift AND it is spiritually rude.
          <br />
          Learning how to gracefully receive a compliment is a powerful step in
          the journey of self empowerment.
          <br />
          So what&#x2019;s going on with that anyway? Why do so many of us
          flinch when someone gives us a compliment?
          <br />
          I have a little tale to share with you... A few years ago, here in
          Swaziland, Africa, I complimented a woman on the boldly colourful
          dress she was wearing. &#x201C;Wow! That is a beautiful colour on
          you!&#x201D;
          <br />
          She responded with, &#x201C;I know, that is true. Thank you.&#x201D;
          <br />
          She took that compliment head on, without a minuscule of hesitation or
          doubt. In fact she opened up and revelled in the greatness of how it
          felt. And that, my NiNJA friend, is not ego, it is the glory of true
          #selfworth.
          <br />
          I remember how I felt as she soaked up my compliment without delay
          &#x2013; it felt slightly shocking to be honest, and that&#x2019;s
          when I realised, this is a very interesting energetic culture that we
          have been perpetuating.
          <br />
          #fear of appearing egotistical has high-jacked basic self worth in our
          western culture &#x2013; in a most terrible way.
          <br />
          Not only do we flinch when people give us a compliment, we also scowl
          if someone else enjoys and fully receives a compliment.
          <br />
          WHAT?
          <br />
          Now clearly there is a difference between a rampaging ego and genuine
          self worth, and it is time for us to stop being so self-depreciating
          and start to stand up straight and SEE straight!
          <br />
          The new culture starts with you and me.
          <br />
          May you take the complimentary ticket, Olof, from this present moment
          and admit your awesomeness.
        </div>
      </div>
    </div>

  </div>

</div>
