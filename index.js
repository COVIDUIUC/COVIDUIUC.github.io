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
const padding = { TOP: 10, RIGHT: 60, LEFT: 60, BOTTOM: 50 };
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
    drawrapper(changeEvent.target.selectedIndex);
    // Runs when the dropdown is changed

    // console.log(changeEvent.target.selectedIndex); // The newly selected index
    // drawBar(dataPoint, changeEvent.target.selectedIndex, xForMonth, yForCovid);
  });
}

// this tells the number of days in a particular month
function daysInMonth(start, end) {
  var days = [];
  for (let i = start; i <= end; i++) {
    days.push(i);
  }
  return days;
}

function drawBar(data, idx, xForMonth, yForCovid) {
  const svg = d3.select("svg");
  const cases_tooltip = d3.select("#cases_tooltip");
  let casesList = parseCOVIDData(MONTHS[idx], data);
  let dayNum = daysInMonth(1, casesList.length);

  svg
    .selectAll("rect")
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
    .attr("x", (dataPoint, i) => xForMonth(dayNum[i]))
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
      cases_tooltip
        .style("left", x + 16 + "px")
        .style("top", y + 16 + "px")
        .style("display", "inline-block")
        .text(d + " cases");
    })
    .on("mousemove", (mouseEvent, d) => {
      let [x, y] = d3.pointer(mouseEvent);
      cases_tooltip.style("left", x + 16 + "px").style("top", y + 16 + "px");
    })
    .on("mouseout", (mouseEvent, d) => {
      cases_tooltip.style("display", "none");
    });
}

function drawLine(count_data, example_data, idx, x, y) {
  const svg = d3.select("svg");
  const posts_tooltip = d3.select("#posts_tooltip");
  let monthlyCountData = parseRedditData(MONTHS[idx], count_data);
  let monthlyExampleData = example_data;
  // console.log(example_data);
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
    .data([monthlyCountData])
    .attr("class", "line")
    .attr("d", valueline)
    .attr("transform", `translate(${7}, 0)`);

  const localVars = d3.local();
  const indexes = d3.local();
  const epochs = d3.local();
  localVars.set(x, x);
  localVars.set(y, y);

  svg
    .append("g")
    .selectAll("circle")
    .data(monthlyCountData)
    .join("circle")
    .attr("cx", (d, i) => x(i + 1))
    .attr("cy", (d) => y(d.num))
    .attr("r", 4)
    .attr("fill", "#69b3a2")
    .attr("transform", `translate(${7}, 0)`)
    .each(function (d, i) {
      // console.log("test");
      // console.log(this);
      indexes.set(this, i); // Store index in local variable.
      epochs.set(this, d.epoch);
    })
    .on("mouseover", function (mouseEvent, d) {
      // Posts tooltip
      let i = indexes.get(this);
      // console.log(posts_tooltip.locked);
      // Unlocks tooltip
      posts_tooltip.locked = false;
      // Shows post tooltip.
      posts_tooltip
        .style("left", localVars.get(x)(i + 1) + 5 + "px")
        .style("top", localVars.get(y)(d.num) + 5 + "px")
        .style("display", "inline-block");
      d3.select("#posts_tooltip_text").text(d.num + " posts");

      let epoch_val = epochs.get(this);
      // Bit of hard coding
      for (let c = 0; c < 3; c++) {
        const link = d3.select("#post_" + (c + 1));
        if (c < monthlyExampleData[epoch_val].length) {
          link
            .text(monthlyExampleData[epoch_val][c][0])
            .attr("href", monthlyExampleData[epoch_val][c][1]);
        } else {
          link.text("");
        }
      }
    })
    .on("mouseout", (mouseEvent, d) => {
      if (!posts_tooltip.locked) {
        posts_tooltip.style("display", "none");
      }
    })
    .on("mousedown", (mouseEvent, d) => {
      posts_tooltip.locked = !posts_tooltip.locked;
    });
}

async function drawrapper(idx = 0) {
  d3.selectAll("svg > *").remove();
  const svg = d3.select("svg");
  const redditData = await d3.csv("./data/timestamped_post_count_data.csv");
  const covidData = await d3.csv("./data/Covid_data.csv");
  const exampleData = await d3.json(
    "./data/timestamped_example_post_data.json"
  );

  const xForMonth = d3
    .scaleBand()
    .domain(dates)
    .range([0 + padding.LEFT, svg.attr("width") - padding.RIGHT])
    .padding(0.3);

  const yForNum = d3
    .scaleLinear()
    .domain([NumPostCorrespondingTo0, NumPostCorrespondingToHeight])
    .range([0 + padding.TOP, svg.attr("height") - padding.BOTTOM]);

  const yForCovid = d3
    .scaleLinear()
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
    .attr("transform", `translate(0, ${svg.attr("height") - padding.BOTTOM})`);

  const yTextyPosition = yForNum.range().reduce((a, b) => a + b, 0) / 2;

  // label for the left vertical axis (COVID cases)
  svg
    .append("text")
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .attr("font-family", "sans-serif")
    .attr(
      "transform",
      `translate(${padding.LEFT / 2} ${
        yForCovid.range().reduce((a, b) => a + b, 0) / 2
      }) rotate(-90)`
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
  if (Number.isInteger(idx) == 0) {
    idx = 0;
  }

  //text for x axis
  const xTextxPosition = xForMonth.range().reduce((a, b) => a + b, 0) / 2;
  svg
    .append("text")
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .attr("font-family", "sans-serif")
    .attr("x", xTextxPosition)
    .attr("y", svg.attr("height") - padding.BOTTOM / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .text("Date");
  drawBar(covidData, idx, xForMonth, yForCovid);
  drawLine(redditData, exampleData, idx, xForMonth, yForNum);
  // console.log(idx);
}
