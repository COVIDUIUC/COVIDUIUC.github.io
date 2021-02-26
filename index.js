/**
 * Main entry point -- this file has been added to index.html in a <script> tag. Add whatever code you want below.
 */
"use strict";

const weatherData = [
  // Temperatures are in F; sorry metric system users.
  {
    city: "(none selected)",
    averageHighByMonth: [],
  },
  {
    // Arrays of length 12, one element for each month, starting with January.
    city: "Urbana, USA",
    averageHighByMonth: [
      32.9,
      37.7,
      49.9,
      62.8,
      73.4,
      82.5,
      85.0,
      83.7,
      78.2,
      65.2,
      50.6,
      36.7,
    ],
  },
  {
    city: "London, UK",
    averageHighByMonth: [
      46.6,
      47.1,
      52.3,
      57.6,
      64.2,
      70.2,
      74.3,
      73.8,
      68.0,
      59.9,
      52.0,
      46.9,
    ],
  },
  {
    city: "Cape Town, SA",
    averageHighByMonth: [
      79.0,
      79.7,
      77.7,
      73.4,
      68.5,
      64.6,
      63.5,
      64.0,
      66.6,
      70.3,
      74.3,
      76.8,
    ],
  },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const padding = { TOP: 0, RIGHT: 20, LEFT: 60, BOTTOM: 40 };
const allTemps = weatherData.map((city) => city.averageHighByMonth).flat();
const TempCorrespondingTo0 = d3.max(allTemps);
const TempCorrespondingToHeight = d3.min(allTemps);
window.addEventListener("load", drawrapper);

function populateDropdown(xForMonth, yForTemp) {
  const select = d3.select("select");
  // select.append("option").text("dsad");
  select
    .selectAll("option")
    .data(weatherData.map((city) => city.city))
    .join("option")
    .text((d) => d);

  select.on("change", (changeEvent, dataPoint) => {
    // Runs when the dropdown is changed
    console.log(changeEvent.target.selectedIndex); // The newly selected index
    drawBar(changeEvent.target.selectedIndex, xForMonth, yForTemp);
  });
}

function drawBar(idx, xForMonth, yForTemp) {
  const svg = d3.select("svg");
  const tooltip = d3.select(".tooltip");

  svg
    .selectAll("rect")
    .data(weatherData[idx].averageHighByMonth)
    .join(
      (enterSelection) => {
        return enterSelection
          .append("rect")
          .attr("height", 0)
          .attr("y", svg.attr("height") - padding.BOTTOM);
      },
      (updateSelection) => {
        return updateSelection;
      },
      (exitSelection) =>
        exitSelection
          .transition()
          .attr("height", 0)
          .attr("y", svg.attr("height") - padding.BOTTOM)
          .remove()
    )
    .attr("x", (dataPoint, i) => xForMonth(MONTHS[i])) // i is dataPoint’s index in the data array
    // .attr("y", (dataPoint, i) => yForTemp(dataPoint))
    .call((selection) => {
      selection
        .transition()
        .attr("y", (dataPoint, i) => yForTemp(dataPoint))
        .attr("height", (dataPoint, i) =>
          // yForTemp((dataPoint - TempCorrespondingToHeight + 10))
          yForTemp(
            -dataPoint + TempCorrespondingTo0 + TempCorrespondingToHeight
          )
        );
    })
    .attr("width", (dataPoint, i) => xForMonth.bandwidth())
    // .attr("height", (dataPoint, i) =>
    //   // yForTemp((dataPoint - TempCorrespondingToHeight + 10))
    //   yForTemp(-dataPoint + TempCorrespondingTo0 + TempCorrespondingToHeight)
    // )
    .attr("fill", "steelblue")
    .on("mouseover", (mouseEvent, d) => {
      // Runs when the mouse enters a rect.  d is the corresponding data point.
      // Show the tooltip and adjust its text to say the temperature.
      let [x, y] = d3.pointer(mouseEvent);
      tooltip
        .style("left", x + 16 + "px")
        .style("top", y + 16 + "px")
        .style("opacity", 1)
        .text(d);
    })
    .on("mousemove", (mouseEvent, d) => {
      let [x, y] = d3.pointer(mouseEvent);
      tooltip.style("left", x + 16 + "px").style("top", y + 16 + "px");
    })
    .on("mouseout", (mouseEvent, d) => {
      tooltip.style("opacity", 0);
    });
}

function drawrapper() {
  // d3 has been added to the html in a <script> tag so referencing it here should work.
  const svg = d3.select("svg");

  const xForMonth = d3
    .scaleBand()
    .domain(MONTHS)
    .range([0 + padding.LEFT, svg.attr("width") - padding.RIGHT]) // TODO
    .padding(0.3); // TODO experiment and choose a number between 0 and 1

  const yForTemp = d3
    .scaleLinear()
    .domain([TempCorrespondingTo0 + 10, TempCorrespondingToHeight - 10])
    .range([0 + padding.TOP, svg.attr("height") - padding.BOTTOM]);

  populateDropdown(xForMonth, yForTemp);

  //y axis and text
  const yAxis = svg
    .append("g")
    .call(d3.axisLeft(yForTemp))
    .attr("transform", `translate(${padding.LEFT}, 0)`); // TODO xTranslation
  const xAxis = svg
    .append("g")
    .call(d3.axisBottom(xForMonth))
    .attr("transform", `translate(0, ${svg.attr("height") - padding.BOTTOM})`); // TODO

  const yTextyPosition = yForTemp.range().reduce((a, b) => a + b, 0) / 2;
  svg
    .append("text")
    .attr("font-size", 12) // This code duplication signals that these properties
    .attr("font-weight", "bold") // should be moved to CSS. For now, the code is this
    .attr("font-family", "sans-serif") // way to simplify our directions to you.
    .attr(
      "transform",
      `translate(${padding.LEFT / 2} ${yTextyPosition}) rotate(-90)`
    )
    .attr("text-anchor", "middle")
    .text("Average high temperature(F)");

  drawBar(0, xForMonth, yForTemp);
}
