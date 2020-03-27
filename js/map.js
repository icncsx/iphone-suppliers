var files = Promise.all([
  d3.csv("../data/address.csv"),
  d3.json("../data/map-low.json")
]).then(function(twoFiles) {
  draw(twoFiles);
});

function draw(twoFiles) {
  // "use strict";

  var margin = {
      top: 30,
      right: 0,
      bottom: 30,
      left: 0
    },
    container_width = 1200,
    container_height = 700,
    width = container_width - margin.left - margin.right,
    height = container_height - margin.top - margin.bottom;

  var svg = d3
    .select("#chart1")
    .append("svg")
    .attr("id", "svg_container")
    .attr("viewBox", `0 0 ${container_width} ${container_height}`)
    .attr("preserveAspectRatio", "xMidYMid");

  var initialLongitude = -120; // Initial longitude to center
  var plotCenter = [width / 2, height / 1.5];
  // console.log(plotCenter);
  var latitudeBounds = [-65, 85]; // Maximum latitude to display
  var baseK = 200;

  var projection = d3
    .geoMercator()
    // the same as .rotate([0,0])
    // .rotate([360, 0])
    .rotate([-initialLongitude, 0])
    .scale(baseK)
    .translate(plotCenter);

  var viewMin = [0, 0];
  var viewMax = [0, 0];

  // console.log(projection([0, 0]), 'sample projection')
  // 1200 x 700

  function updateProjectionBounds() {
    // Updates the view top left and bottom right with the current projection.
    var yaw = projection.rotate()[0];
    var longitudeHalfRotation = 180.0 - 1e-6;

    viewMin = projection([-yaw - longitudeHalfRotation, latitudeBounds[1]]);
    viewMax = projection([-yaw + longitudeHalfRotation, latitudeBounds[0]]);
  }

  updateProjectionBounds();

  // Set up the scale extent and initial scale for the projection.
  var s = width / (viewMax[0] - viewMin[0]);

  var scaleExtent = [1, 9]; // The minimum and maximum zoom scales

  projection.scale(scaleExtent[0] * baseK); // Set up projection to minimium zoom

  var path = d3.geoPath(projection);

  var worldMap = twoFiles[1];
  var addressData = twoFiles[0];

  var uniqueContinents = _.uniq(
    worldMap.features.map(function(d) {
      return d["properties"]["continent"];
    })
  );

  var zoom = d3
    .zoom()
    .scaleExtent(scaleExtent)
    .on("zoom", handlePanZoom);

  var translateLast = [0, 0];
  var scaleLast = null;

  function handlePanZoom() {
    // Handle pan and zoom events
    var scale = d3.event.transform.k * baseK;
    // console.log('scale: '+scale);

    var translate = [d3.event.transform.x, d3.event.transform.y];

    // If the scaling changes, ignore translation (otherwise touch zooms are weird).
    var delta = [
      translate[0] - translateLast[0],
      translate[1] - translateLast[1]
    ];
    if (scale != scaleLast) {
      projection.scale(scale);
    } else {
      var longitude = projection.rotate()[0];
      var tp = projection.translate();

      // Use the X translation to rotate, based on the current scale.
      longitude +=
        360 * (delta[0] / width) * ((scaleExtent[0] * baseK) / scale);
      projection.rotate([longitude, 0, 0]);

      // Use the Y translation to translate projection, clamped by min/max
      updateProjectionBounds();

      if (viewMin[1] + delta[1] > 0) delta[1] = -viewMin[1];
      else if (viewMax[1] + delta[1] < height) delta[1] = height - viewMax[1];

      projection.translate([tp[0], tp[1] + delta[1]]);
    }

    // // Store the last transform values. NOTE: Resetting zoom.translate() and zoom.scale()
    // // would seem equivalent, but it doesn't seem to work reliably.
    scaleLast = scale;
    translateLast = translate;

    render();
  }

  function render() {
    // console.log('rendering')
    svg.selectAll(".country").attr("d", path);

    svg.selectAll(".link").attr("d", link);

    svg
      .selectAll("circle")
      .attr("cx", function(d) {
        return projection([d.lon, d.lat])[0];
      })
      .attr("cy", function(d) {
        return projection([d.lon, d.lat])[1];
      });
    // resize the circles
    svg.selectAll("circle.suppliers").each(function() {
      d3.select(this).attr("r", 3 * Math.sqrt(d3.event.transform.k));
    });
  }

  svg.call(zoom);

  var z_scale = d3
    .scaleOrdinal()
    .domain(uniqueContinents)
    .range(["#BFBFBF", "#6BBAB5", "#7DBC8E", "#EECA82", "#AABCC3", "#C19185"]);

  svg
    .selectAll("woj")
    .data(worldMap.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", function(d) {
      return z_scale(d["properties"]["continent"]);
    })
    .attr("stroke", "rgb(238,238,238)")
    .attr("stroke-width", 1)
    .attr("opacity", 0.7)
    .on("mouseover", function(d) {
      div
        .transition()
        .duration(200)
        .style("opacity", 0.9);

      div
        .html(
          `
      <p>${d["properties"]["name"]}</p>
      `
        )
        .style("color", "black")
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function(d) {
      div
        .transition()
        .duration(500)
        .style("opacity", 0);
    });

  var appleLat = 37.3321;
  var appleLon = -122.030739;

  svg
    .selectAll("apple")
    .data([
      {
        FIRM: "Apple Inc.",
        ADDRESS: "One Infinite Loop Cupertino, CA",
        lat: appleLat,
        lon: appleLon
      }
    ])
    .enter()
    .append("circle")
    .attr("class", "apple")
    .style("fill", "teal")
    .style("opacity", "0.8")
    .attr("r", 10)
    .attr("cx", function(d) {
      return projection([d.lon, d.lat])[0];
    })
    .attr("cy", function(d) {
      return projection([d.lon, d.lat])[1];
    });

  repeat();

  function repeat() {
    d3.select(".apple")
      .attr("r", 15)
      .transition()
      .duration(2000)
      .attr("r", 20)
      .transition()
      .duration(2000)
      .attr("r", 15)
      .on("end", repeat);
  }
  // firm circle
  svg
    .selectAll(".othercircle")
    .data(addressData)
    .enter()
    .append("circle")
    .attr("class", "suppliers")
    .style("fill", "#3D013C")
    .style("opacity", "0.6")
    .attr("r", "3")
    .attr("cx", function(d) {
      return projection([d.lon, d.lat])[0];
    })
    .attr("cy", function(d) {
      return projection([d.lon, d.lat])[1];
    })
    .on("mouseover", function(d) {
      div
        .transition()
        .duration(200)
        .style("opacity", 0.9);

      div
        .html(
          `
      <p>${d.FIRM}</p> 
      <br/>
      <p>${d.ADDRESS}</p>
      `
        )
        .style("color", "black")
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function(d) {
      div
        .transition()
        .duration(500)
        .style("opacity", 0);
    });

  var linestring_data = [];
  addressData.forEach(function(d, i) {
    linestring_data.push({
      source: {
        x: d.lon,
        y: d.lat
      },
      target: {
        x: appleLon,
        y: appleLat
      }
    });
  });

  var link = d3
    .linkHorizontal()
    .x(function(d) {
      return projection([d.x, 0])[0];
    })
    .y(function(d) {
      return projection([0, d.y])[1];
    });

  svg
    .selectAll(".arc")
    .data(linestring_data)
    .enter()
    .append("path")
    .attr("class", "link");

  var arcs = d3.selectAll(".link")._groups[0];

  svg
    .selectAll(".link")
    .attr("pointer-events", "none")
    .attr("opacity", "0")
    .style("fill", "none")
    .style("stroke", "#146A8C")
    .style("stroke-width", "1px")
    .transition()
    .attr("d", link)
    .attr("opacity", "0.2");

  var hide = true;
  d3.select(".btn").on("click", function() {
    let label = d3.select(this).text();
    if (hide) {
      d3.selectAll(".link")
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .attr("opacity", "0");
      d3.select(this).text("Show Lines");
    } else {
      d3.selectAll(".link")
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .attr("opacity", "0.2");
      d3.select(this).text("Hide Lines");
    }
    hide = !hide;
  });

  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var controller = new ScrollMagic.Controller();

  new ScrollMagic.Scene({
    triggerElement: ".onoff",
    offset: 0,
    triggerHook: 0.4,
    duration: "100%"
  })
    // .addIndicators()
    .on("enter", function() {
      let links = d3.selectAll(".link");
      let length = links.nodes().length;
      links.attr("opacity", "0");

      links
        .attr("d", "")
        .transition()
        .delay(function(d, i) {
          return (i / length) * 1000;
        })
        .ease(d3.easeLinear)
        .attr("d", link)
        .attr("opacity", "0.2");
    })
    .on("leave", function() {
      // console.log('leave')
      let links = d3.selectAll(".link");
      let length = links.nodes().length;
      links
        .transition()
        .delay(function(d, i) {
          return (i / length) * 1000;
        })
        .ease(d3.easeLinear)
        .attr("opacity", "0");
    })
    .addTo(controller);
}
