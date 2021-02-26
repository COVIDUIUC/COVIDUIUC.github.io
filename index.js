"use strict";
const weatherData = [ // Temperatures are in F; sorry metric system users.
    { // Arrays of length 12, one element for each month, starting with January.
        city: "Urbana, USA",
        averageHighByMonth: [32.9, 37.7, 49.9, 62.8, 73.4, 82.5, 85.0, 83.7, 78.2, 65.2, 50.6, 36.7]
    },
    {
        city: "London, UK",
        averageHighByMonth: [46.6, 47.1, 52.3, 57.6, 64.2, 70.2, 74.3, 73.8, 68.0, 59.9, 52.0, 46.9]
    },
    {
        city: "Cape Town, SA",
        averageHighByMonth: [79.0, 79.7, 77.7, 73.4, 68.5, 64.6, 63.5, 64.0, 66.6, 70.3, 74.3, 76.8]
    }
];

window.addEventListener("load", drawBarGraph);

function drawBarGraph() {
    const svg = d3.select("svg");
    const padding = 20;
    const spacing = 50;

    // scaleBand API --> https://github.com/d3/d3-scale/blob/master/README.md#band-scales
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const xForMonth = d3.scaleBand()
        .domain(MONTHS)
        .range([padding, svg.attr("width") - spacing])
        .padding(0.2);

    const allTemps = weatherData.map(city => city.averageHighByMonth).flat().sort().reverse();

    const yForTemperature = d3.scaleBand()
        .domain(allTemps)
        .range([padding, svg.attr("height") - spacing])
        .padding(0.2);

    const xAxis = svg.append("g")
        .call(d3.axisBottom(xForMonth))
        .attr("transform", `translate(${padding+10}, ${svg.attr("height") - spacing})`);
    const yAxis = svg.append("g")
        .call(d3.axisLeft(yForTemperature))
        .attr("transform", `translate(${spacing}, 0)`);

    svg.append("text")
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .attr("font-family", "sans-serif")
        .attr("x", svg.attr("width")/2+padding)
        .attr("y", svg.attr("height")-padding+10)
        .attr("text-anchor", 'middle')
        .attr("dominant-baseline", 'text-bottom')
        .text("Month");
    svg.append("text")
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .attr("font-family", "sans-serif")
        .attr("transform", `translate(${padding-10} ${svg.attr("height")/2-padding}) rotate(-90)`)
        .attr("text-anchor", 'middle')
        .attr("dominant-baseline", 'auto')
        .text("Average high temperature (F)");

    // helpful guide for tooltips: https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html
    var toolTip = d3.select('#toolTip').append('div').style('opacity', 0).attr('class', 'tooltip');
    var mouseOver = function(d) {
        toolTip
            .transition().duration(200)
            .style('opacity', 1);
        d3.select(this)
            .style('stroke', 'black')
            .style('border', 'double')
            .style('opacity', 1);
    }
    var mouseMove = function(mouse, d) {
        toolTip.html('The temperature in this month is ' + d)
            .style("left", (d3.pointer(mouse)[0]) + "px")
            .style("top", (d3.pointer(mouse)[1] - spacing) + "px");
        d3.select(this).style('opacity', 1);
    }
    var mouseOut = function(d) {
        toolTip
            .transition().duration(200)
            .style('opacity', 0);
        d3.select(this)
            .style('stroke', 'none')
            .style('border', 'none')
            .style('opacity', 0.7);
    }
    function renderByCityIdx(idx) {
        svg.selectAll("rect")
        .data(weatherData[idx].averageHighByMonth)
        .join("rect")
            .attr("x", (dataPoint, i) => padding+10+xForMonth(MONTHS[i])) // i is dataPoint’s index in the data array
            .attr("y", (dataPoint, i) => yForTemperature(dataPoint))
            .attr("width", (dataPoint, i) => xForMonth.bandwidth())
            .attr("height", (dataPoint, i) => svg.attr("height") - spacing - yForTemperature(dataPoint))
            .attr("fill", "steelblue")
            .style("opacity", 0.7)
            .on("mouseover", mouseOver)
            .on("mousemove", mouseMove)
            .on("mouseout", mouseOut);
    };
    // render bar graph for the first city on the list
    renderByCityIdx(0);
    // get a list of all the cities
    var cities = weatherData.map(({city})=>city);
    // lots of help from: https://www.d3-graph-gallery.com/graph/line_select.html
    const select = d3.select("select");
    // create options as the children of select
    var options = select.selectAll("option")
        .data(cities)
        .enter()
        .append("option")
        .attr("value", d=>d)
        .text(d=>d);

    select.on("change", (changeEvent, dataPoint) => {
        // runs when the dropdown is changed
        var selectedIdx = changeEvent.target.selectedIndex;
        // render bar graph for the city we select
        renderByCityIdx(selectedIdx);
    });
}

