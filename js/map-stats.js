d3.csv("../data/country_count.csv").then(function (data) {
  draw1(data);
});

function draw1(data) {

  "use strict";

  var margin = {
    left: 130,
    right: 20,
    //  the spacing we provide so that the axis fits
    axisMargin: 40,
    // the spacing we provide so that the title fits
    titleSpace: 60
  };

  // 100% of the viewport height
  var container_width = d3.select('#chart2').node().clientWidth;
  var container_height = d3.select('#chart2').node().clientHeight;

  // a rough way to proxy mobile as well
  if (container_width < 600){
    margin.left = 110;
    margin.right = 30;
  } 

  var width = container_width - margin.left - margin.right;
  var height = container_height - margin.axisMargin - margin.titleSpace;

  var svg_container = d3
    .select("#chart2")
    .append("svg")
    .attr("id", "svg_container")
    .attr('width', container_width)
    .attr('height', container_height)

var svg = svg_container
    .append("g")
    .attr("class", "groupcontainer")
    .attr("transform", `translate(${margin.left}, ${margin.axisMargin})`);
    // .range([0, height])

  d3.select(window).on("resize", resize);

  function resize() {

    // console.log('resizing')

    container_width = d3.select("#chart2").node().clientWidth;
    container_height = d3.select("#chart2").node().clientHeight;

    if (container_width < 600){
      // console.log('changing to small margin left')
      margin.left = 100;
      margin.right = 30;
      // margin.axisMargin = 40;
      // margin.titleSpace = 50;
    } else {
      // console.log('changing to big margin left')
      margin.left = 130;
      margin.right = 20;
    }

    width = container_width - margin.left - margin.right;
    height = container_height - margin.axisMargin - margin.titleSpace;

  svg_container
    .transition()
    .attr('width', container_width)
    .attr('height', container_height)

  svg
  .transition()
  .attr("transform", "translate(" + margin.left + "," + margin.axisMargin + ")");

    x_scale
      .range([0, width]);
    y_scale
      .range([0, height]);

      xAxis
      .transition()
      .call(
        d3
          .axisTop(x_scale)
      )
    .call(g => g.select(".domain").remove())
      yAxis
        .transition()
        .call(
          d3
            .axisLeft(y_scale)
        )
        .call(g => g.select(".domain").remove())

      d3.selectAll(".bar-line")
        .transition()
        .attr("x1", function (d) {
          return x_scale(0);
        })
        .attr("x2", function (d) {
          return x_scale(d.COUNT);
        })
        .attr("y1", function (d) {
          return y_scale(d.COUNTRY) + y_scale.bandwidth() / 2;
        })
        .attr("y2", function (d) {
          return y_scale(d.COUNTRY) + y_scale.bandwidth() / 2;
        })
        // .style('stroke', '#0D7680')

  }

  var focus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("text")
    .attr("x", 15)
    .attr('text-anchor', 'start')
    .attr('opacity', '0')
    .attr('dominant-baseline', 'middle');

  svg.append("rect")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "overlay")
    .attr('fill', 'transparent')
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function () { focus.style("display", null); })
    .on("mouseout", function () { focus.style("display", "none"); })
    .on("mousemove", function () {

      let yPos = d3.mouse(this)[1];
      let domain = y_scale.domain();
      let range = y_scale.range();
      let rangePoints = d3.range(range[0], range[1], y_scale.step())
      let xPos = d3.bisect(rangePoints, yPos) - 1;
      let xLabel = domain[xPos]

      let d = data[xPos];

      // find the positon by index
      d3.selectAll('#chart2 .bar-line')
        .transition()
        .style('stroke', '#8F223A')

      d3.select(d3.selectAll('#chart2 .bar-line').nodes()[xPos])
        .transition()
        .style('stroke', '#0D7680')

      var x = x_scale(d.COUNT);
      var y = y_scale(d.COUNTRY) + y_scale.bandwidth() / 2;

      focus.attr("transform", "translate(" + x + "," + y + ")");
      focus.select("text").text(d.COUNT);

      // var y_domain = y_scale.domain();
      // var y_range = y.range();
      // var ypos = y_domain[d3.bisect(y_range, xpos) - 1];
      // let y0 = x_scale.invert(d3.mouse(this)[1]);
      // let i = bisector(data, y0, 1);
      // let d0 = data[i - 1];
      // let d1 = data[i];
      // let d = y0 - d0.COUNT > d1.COUNT - y0 ? d1 : d0;

    });

  var chart = d3.select('#svg_container')
    .append('g')
    .attr('id', 'text-label')

  var countries = data.map(function (d) {
    return d.COUNTRY;
  })

  var x_scale = d3
    .scaleLinear()
    // max is 301 and min is 1
    .domain([0, 320])
    .range([0, width]);

  // console.log(x_scale.range())

  var xAxis = svg.append("g").attr("class", "x-axis");
  xAxis
    // .attr("transform", `translate(${0},${0})`)
    .call(
      d3
        .axisTop(x_scale)
        .tickSizeInner(10)
        .tickSizeOuter(0)
        .tickPadding(5)
    )
    .call(g => g.select(".domain").remove())
    // .call(g => g.selectAll('text').style('font-size', '15'))

  var y_scale = d3
    .scaleBand()
    .domain(countries)
    .range([0, height])
    .padding(0);

  var yAxis = svg.append("g").attr("class", "x-axis");
  yAxis
    .attr("transform", `translate(${-5},${0})`)
    .call(
      d3
        .axisLeft(y_scale)
        // .tickSizeInner(0)
        // .tickSizeOuter(0)
        .tickPadding(5)
    )
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll("line").remove())
    // .call(g => g.selectAll('text').style('font-size', '15'))

  var lines = svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("line")
    .attr('class', 'bar-line')
    .attr("x1", function (d) {
      return x_scale(0);
    })
    .attr("y1", function (d) {
      return y_scale(d.COUNTRY) + y_scale.bandwidth() / 2;
    })
    .attr("x2", function (d) {
      return x_scale(0);
    })
    .attr("y2", function (d) {
      return y_scale(d.COUNTRY) + y_scale.bandwidth() / 2;
    })
    .attr("stroke-width", 3.5)
    .attr('stroke-dasharray', "1.0,4.0")
    .style('stroke-linecap', 'round')
    .attr('stroke', '#8F223A')
    .attr('opacity', '1');

  var length = d3.selectAll('#chart2 line').nodes().length;

  var controller = new ScrollMagic.Controller();

  // THIS IS THE TITLE
  new ScrollMagic.Scene({
    triggerElement: '#chart2',
    triggerHook: 0,
    offset: 0
  })
    // .addIndicators()
    .setClassToggle('.popup', 'fade-in')
    .addTo(controller);

  new ScrollMagic.Scene({
    triggerElement: '#chart2',
    offset: 500,
    triggerHook: 0.5,
    duration: 500
  })
    // .addIndicators()
    .on('enter', function () {
      let lineinterest = d3.select(d3.selectAll('.bar-line').nodes()[0]);
      lineinterest
        .transition()
        .duration(500)
        .attr("x2", function (d) {
          return x_scale(d.COUNT);
        })

    })
    .on('leave', function () {

      let lineinterest = d3.select(d3.selectAll('.bar-line').nodes()[0]);
      lineinterest
        .transition()
        .duration(500)
        .attr('stroke', '#8F223A')
        .attr("x2", function (d) {
          return x_scale(0);
        })

    })
    .addTo(controller);


  new ScrollMagic.Scene({
    triggerElement: '#chart2',
    offset: 1000,
    triggerHook: 0.5,
    duration: 500
  })
    // .addIndicators()
    .on('enter', function () {

      let lineinterest = d3.selectAll(d3.selectAll('.bar-line').nodes().slice(0, 5));
      lineinterest
        .transition()
        .duration(500)
        .attr("x2", function (d) {
          return x_scale(d.COUNT);
        });

    })
    .on('leave', function () {
      let lineinterest = d3.selectAll(d3.selectAll('.bar-line').nodes().slice(1, 5));
      lineinterest
        .transition()
        .duration(500)
        .attr("x2", function (d) {
          return x_scale(0);
        });
    })
    .addTo(controller);



  new ScrollMagic.Scene({
    triggerElement: '#chart2',
    offset: 1500,
    triggerHook: 0.5,
    duration: 600
  })
    // .addIndicators()
    .on('enter', function () {

      focus.select("text").
        transition()
        .delay(500)
        .duration(500)
        .attr('opacity', '1');

      d3.selectAll('.bar-line')
        // .transition()
        // .duration(500)
        .attr("x2", function (d) {
          return x_scale(0);
        })
        .transition()
        .duration(100)
        .delay(function (d, i) {
          return i / length * 1000;
        })
        .attr("x2", function (d) {
          return x_scale(d.COUNT);
        });

    })
    .on('leave', function () {

      focus.select("text").
        transition()
        .duration(300)
        .attr('opacity', '0');

      d3.selectAll('.bar-line')
        .transition()
        .duration(500)
        .attr("x2", function (d) {
          return x_scale(0);
        })
    })
    .addTo(controller);

  TweenMax.set('.note--1', { left: '50%', top: '100%' });
  new ScrollMagic.Scene({
    triggerElement: '.chart2-container',
    offset: 300,
    triggerHook: 0.5,
    duration: 1000
  })
    // .addIndicators()
    .setTween(
      new TimelineMax()
        .to('.note--1', 1, { left: '50%', top: '-50%', ease: Power0.easeNone }, 0)
    )
    .addTo(controller);

  TweenMax.set('.note--2', { left: '50%', top: '100%' });
  new ScrollMagic.Scene({
    triggerElement: '.chart2-container',
    offset: 800,
    triggerHook: 0.5,
    duration: 1000
  })
    // .addIndicators()
    .setTween(
      new TimelineMax()
        .to('.note--2', 1, { left: '50%', top: '-50%', ease: Power0.easeNone }, 0)
    )
    .addTo(controller);


  TweenMax.set('.note--3', { left: '50%', top: '100%' });
  new ScrollMagic.Scene({
    triggerElement: '#chart2',
    offset: 1300,
    triggerHook: 0.5,
    duration: 1000
  })
    // .addIndicators()
    .setTween(
      new TimelineMax()
        .to('.note--3', 1, { left: '50%', top: '-50%', ease: Power0.easeNone }, 0)
    )
    .addTo(controller);

  new ScrollMagic.Scene({
    triggerElement: '#chart2',
    offset: 30,
    triggerHook: 0.05,
    duration: 1700
  })
    // .addIndicators()
    .setPin('#chart2', { pushFollowers: true })
    .on('enter', function () {
    })
    .addTo(controller);

  var bisector = d3.bisector(function (d) {
    return d.COUNTRY
  })

}