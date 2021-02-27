/**
 * Main entry point -- this file has been added to index.html in a <script> tag. Add whatever code you want below.
 */
"use strict";
import { parseCOVIDData, parseRedditData } from "./util.js";

const MONTHS = [
  "Aug 2020",
  "Sep 2020",
  "Oct 2020",
  "Nov 2020",
  "Dec 2020",
  "Jan 2021",
  "Feb 2021",
];

const dates = [...Array(32).keys()].slice(1);
const padding = { TOP: 10, RIGHT: 60, LEFT: 60, BOTTOM: 40 };
//line chart const
const NumPostCorrespondingTo0 = 50;
const NumPostCorrespondingToHeight = 0;
//bar chat const
// const TempCorrespondingTo0 = d3.max(allTemps);
// const TempCorrespondingToHeight = d3.min(allTemps);
window.addEventListener("load", drawrapper);

function populateDropdown(xForMonth, yForTemp) {
  const select = d3.select("select");
  // select.append("option").text("dsad");
  select
    .selectAll("option")
    .data(MONTHS)
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

function drawLine(data, idx, x, y) {
  const svg = d3.select("svg");
  //FIXME: hardcode idx
  let monthlyData = parseRedditData(MONTHS[0], data);
  console.log(monthlyData);
  let valueline = d3
    .line()
    .x(function (d, i) {
      return x(i + 1);
    })
    .y(function (d) {
      return y(d.num);
    })
    .curve(d3.curveMonotoneX);
  svg
    .append("path")
    .data([monthlyData])
    .attr("class", "line")
    .attr("d", valueline)
    .attr("transform", `translate(${7}, 0)`);
  svg
    .append("g")
    .selectAll("circle")
    .data(monthlyData)
    .join("circle")
    .attr("cx", (d, i) => x(i + 1))
    .attr("cy", (d) => y(d.num))
    .attr("r", 2.5)
    .attr("fill", "#69b3a2")
    .attr("transform", `translate(${7}, 0)`);
}

async function drawrapper() {
  // d3 has been added to the html in a <script> tag so referencing it here should work.
  const svg = d3.select("svg");
  let data = await d3.csv("./data/timestamped_post_count_data.csv");
  const xForMonth = d3
    .scaleBand()
    .domain(dates)
    .range([0 + padding.LEFT, svg.attr("width") - padding.RIGHT])
    .padding(0.3);

  const yForNum = d3
    .scaleLinear()
    .domain([NumPostCorrespondingTo0, NumPostCorrespondingToHeight])
    .range([0 + padding.TOP, svg.attr("height") - padding.BOTTOM]);

  populateDropdown(xForMonth, yForNum);

  //y axis for bar chart
  const leftyAxis = svg
    .append("g")
    .call(d3.axisLeft(yForNum))
    .attr("transform", `translate(${padding.LEFT}, 0)`);
  //y axis for line graph
  const rightyAxis = svg
    .append("g")
    .call(d3.axisRight(yForNum))
    .attr("transform", `translate(${svg.attr("width") - padding.RIGHT}, 0)`);

  const xAxis = svg
    .append("g")
    .call(d3.axisBottom(xForMonth))
    .attr("transform", `translate(0, ${svg.attr("height") - padding.BOTTOM})`); // TODO

  const yTextyPosition = yForNum.range().reduce((a, b) => a + b, 0) / 2;
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
  svg
    .append("text")
    .attr("font-size", 12) // This code duplication signals that these properties
    .attr("font-weight", "bold") // should be moved to CSS. For now, the code is this
    .attr("font-family", "sans-serif") // way to simplify our directions to you.
    .attr(
      "transform",
      `translate(${
        svg.attr("width") - padding.RIGHT / 2
      } ${yTextyPosition}) rotate(90)`
    )
    .attr("text-anchor", "middle")
    .text("Number of COVID related post");

  // drawBar(0, xForMonth, yForTemp);
  drawLine(data, 0, xForMonth, yForNum);
}
