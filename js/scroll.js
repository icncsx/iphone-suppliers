$(document).ready(function() {
  var offsetHeight = d3
    .select(".coda")
    .node()
    .getBoundingClientRect().height;

  var codaMargin = getComputedStyle(document.querySelector(".coda"))
    .marginBottom;
  var totalOffset =
    parseFloat(codaMargin.slice(0, -2)) + parseFloat(offsetHeight);

  // 300 in height // width 60 margin at the bottom
  TweenMax.set(".coda--1", { y: -totalOffset * 0, autoAlpha: 0 });
  TweenMax.set(".coda--2", { y: -totalOffset * 1, autoAlpha: 0 });
  TweenMax.set(".coda--3", { y: -totalOffset * 2, autoAlpha: 0 });

  var controller = new ScrollMagic.Controller();

  new ScrollMagic.Scene({
    triggerElement: ".f46e3 p:last-child",
    offset: 0,
    triggerHook: 0.5,
    duration: 200
  })
    // .addIndicators()
    .setTween(
      new TimelineMax().to(
        ".coda--1",
        1,
        { autoAlpha: 1, ease: Power0.easeNone },
        0
      )
    )
    .addTo(controller);

  new ScrollMagic.Scene({
    triggerElement: ".coda--1",
    offset: -100,
    triggerHook: 0.2,
    duration: 250
  })
    // .addIndicators()
    .setTween(
      new TimelineMax()
        .to(".coda--2", 0.4, { autoAlpha: 1, ease: Power0.easeNone }, 0)
        .to(".coda--2", 1, { y: 0, ease: Power0.easeNone }, 0)

        .to(".coda--3", 0.4, { autoAlpha: 1, ease: Power0.easeNone }, 0)
        .to(".coda--3", 1, { y: 0, ease: Power0.easeNone }, 0)
    )
    .addTo(controller);

  //  COMPONENTS SECTION

  TweenMax.set(".component--1", { y: -100, left: "30%", autoAlpha: 0 });
  TweenMax.set(".component--2", { y: -100, left: "20%", autoAlpha: 0 });
  TweenMax.set(".component--3", { y: -100, left: "10%", autoAlpha: 0 });
  TweenMax.set(".component--4", { y: -100, left: "-10%", autoAlpha: 0 });
  TweenMax.set(".component--5", { y: -100, left: "-20%", autoAlpha: 0 });
  TweenMax.set(".component--6", { y: -100, left: "-30%", autoAlpha: 0 });

  new ScrollMagic.Scene({
    triggerElement: ".coda--3",
    offset: 30,
    triggerHook: 0.05,
    duration: 200
  })
    // .addIndicators()
    .setPin(".coda--3", { pushFollowers: false })
    .addTo(controller);

  new ScrollMagic.Scene({
    triggerElement: ".coda--3",
    offset: 30,
    triggerHook: 0.05,
    duration: 200
  })
    // .addIndicators()
    .setPin(".component", { pushFollowers: true })
    .addTo(controller);

  new ScrollMagic.Scene({
    triggerElement: ".coda--3",
    offset: 30,
    triggerHook: 0.05,
    duration: 200
  })
    // .addIndicators()
    .setTween(
      new TimelineMax()
        .to(
          ".component--1",
          1,
          {
            y: 0,
            left: "0%",
            autoAlpha: 1,
            visibility: "visible",
            ease: Power0.easeNone
          },
          0
        )
        .to(
          ".component--2",
          1,
          {
            y: 0,
            left: "0%",
            autoAlpha: 1,
            visibility: "visible",
            ease: Power0.easeNone
          },
          1
        )
        .to(
          ".component--3",
          1,
          {
            y: 0,
            left: "0%",
            autoAlpha: 1,
            visibility: "visible",
            ease: Power0.easeNone
          },
          2
        )
        .to(
          ".component--4",
          1,
          {
            y: 0,
            left: "0%",
            autoAlpha: 1,
            visibility: "visible",
            ease: Power0.easeNone
          },
          3
        )
        .to(
          ".component--5",
          1,
          {
            y: 0,
            left: "0%",
            autoAlpha: 1,
            visibility: "visible",
            ease: Power0.easeNone
          },
          4
        )
        .to(
          ".component--6",
          1,
          {
            y: 0,
            left: "0%",
            autoAlpha: 1,
            visibility: "visible",
            ease: Power0.easeNone
          },
          5
        )
    )
    .addTo(controller);

  $(".parts li").each(function() {
    var scene = new ScrollMagic.Scene({
      triggerElement: this,
      triggerHook: 0.2,
      offset: 70,
      reverse: true
    })
      // .addIndicators()
      .setClassToggle(this, "fade-in")
      .addTo(controller);
  });

  var div = d3
    .select("body")
    .append("div")
    .attr("class", "stat-tooltip")
    .style("opacity", 0);
});
