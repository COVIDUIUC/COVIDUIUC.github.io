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
const maxCases = 240;
const minCases = 0;
window.addEventListener("load", drawrapper);

function populateDropdown(xForMonth, yForCovid) {
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
    // drawBar(dataPoint, changeEvent.target.selectedIndex, xForMonth, yForCovid);
  });
}

// this tells the number of days in a particular month
function daysInMonth(lo, hi) {
  var days = [];
  for (let i = lo; i <= hi; i++) { days.push(i); }
  return days;
}

function drawBar(data, idx, xForMonth, yForCovid) {
  const svg = d3.select("svg");
  const tooltip = d3.select(".tooltip");

  let casesList = parseCOVIDData(MONTHS[idx], data);
  let startDay = (MONTHS[idx] === "Jul 2020" ? 6 : 1);
  let endDay = casesList.length;
  let monthSpan = daysInMonth(startDay, endDay);

  svg.selectAll("rect")
    .data(casesList)
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
      .attr("x", (dataPoint, i) => xForMonth(monthSpan[i]))
      // .call((selection) => {
      //   selection
      //     .transition()
      //     .attr("y", (dataPoint, i) => yForCovid(dataPoint))
      //     .attr("height", (dataPoint, i) => yForCovid(-dataPoint + maxCases + 9));
      // })
      .attr("width", (dataPoint, i) => xForMonth.bandwidth())
      .attr("y", (dataPoint, i) => yForCovid(dataPoint))
      .attr("height", (dataPoint, i) => yForCovid(-dataPoint + maxCases + 9))
      .attr("fill", "#F4900C")
      .on("mouseover", (mouseEvent, d) => {
        // Runs when the mouse enters a rect.  d is the corresponding data point.
        // Show the tooltip and adjust its text to say the temperature.
        let [x, y] = d3.pointer(mouseEvent);
        tooltip
          .style("left", x + 16 + "px")
          .style("top", y + 16 + "px")
          .style("opacity", 1)
          .text(d + " cases");
      })
      .on("mousemove", (mouseEvent, d) => {
        let [x, y] = d3.pointer(mouseEvent);
        tooltip.style("left", x + 16 + "px").style("top", y + 16 + "px");
      })
      .on("mouseout", (mouseEvent, d) => { tooltip.style("opacity", 0) });
}

function drawLine(data, idx, x, y) {
  const svg = d3.select("svg");
  //FIXME: hardcode idx
  let monthlyData = parseRedditData(MONTHS[idx], data);
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
  const redditData = await d3.csv("./data/timestamped_post_count_data.csv");
  const covidData = await d3.csv("./data/Covid_data.csv");

  const xForMonth = d3
    .scaleBand()
    .domain(dates)
    .range([0 + padding.LEFT, svg.attr("width") - padding.RIGHT])
    .padding(0.3);

  const yForNum = d3
    .scaleLinear()
    .domain([NumPostCorrespondingTo0, NumPostCorrespondingToHeight])
    .range([0 + padding.TOP, svg.attr("height") - padding.BOTTOM]);

  const yForCovid = d3.scaleLinear()
    .domain([maxCases, minCases])
    .range([0 + padding.TOP, svg.attr("height") - padding.BOTTOM]);

  populateDropdown(xForMonth, yForNum);

  //y axis for bar chart
  const leftyAxis = svg
    .append("g")
    .call(d3.axisLeft(yForCovid))
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

  // label for the left vertical axis (COVID cases)
  svg
    .append("text")
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .attr("font-family", "sans-serif")
    .attr(
      "transform",
      `translate(${padding.LEFT / 2} ${yForCovid.range().reduce((a, b) => a + b, 0) / 2}) rotate(-90)`
    )
    .attr("text-anchor", "middle")
    .text("Number of positive COVID cases");

  // label for the right vertical axis (Reddit posts)
  svg
    .append("text")
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .attr("font-family", "sans-serif")
    .attr(
      "transform",
      `translate(${
        svg.attr("width") - padding.RIGHT / 2
      } ${yTextyPosition}) rotate(90)`
    )
    .attr("text-anchor", "middle")
    .text("Number of COVID related post");

  drawBar(covidData, 0, xForMonth, yForCovid);
  drawLine(redditData, 0, xForMonth, yForNum);
}
