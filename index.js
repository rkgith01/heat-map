const endPoint =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
// Set up dimensions and margins
const margin = { top: 50, right: 50, bottom: 100, left: 100 };
const width =
  Math.min(1000, window.innerWidth - 20) - margin.left - margin.right;
const height =
  Math.min(600, window.innerHeight - 20) - margin.top - margin.bottom;
// Append the SVG
const svg = d3
  .select("#heat-map")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the dataset
d3.json(endPoint).then((data) => {
  // Process the data
  const baseTemp = data.baseTemperature;
  const monthlyData = data.monthlyVariance;

  // Set up scales
  const xScale = d3
    .scaleBand()
    .domain(monthlyData.map((d) => d.year))
    .range([0, width]);

  const yScale = d3
    .scaleBand()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .range([height, 0]);

  const colorScale = d3
    .scaleLinear()
    .domain(d3.extent(monthlyData, (d) => baseTemp + d.variance))
    .range(["skyblue", "darkred"]);

  // Draw the heatmap
  svg
    .selectAll(".cell")
    .data(monthlyData)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(baseTemp + d.variance))
    .attr("data-year", (d) => d.year)
    .attr("data-month", (d) => d.month - 1)
    .attr("data-temp", (d) => baseTemp + d.variance)
    .on("mouseover", (event, d) => {
      d3.select("#tooltip")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 30 + "px")
        .attr("data-year", d.year)
        .select("#year")
        .text(d.year);

      d3.select("#tooltip")
        .select("#month")
        .text(d3.timeFormat("%B")(new Date(0, d.month - 1, 1)));

      d3.select("#tooltip")
        .select("#temp")
        .text((baseTemp + d.variance).toFixed(2));

      d3.select("#tooltip").classed("visible", true);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").classed("visible", false);
    });

  // Draw x-axis
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3
        .axisBottom(xScale)
        .tickValues(xScale.domain().filter((year) => year % 10 === 0))
    );

  // Draw y-axis
  svg
    .append("g")
    .attr("id", "y-axis")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat((month) => d3.timeFormat("%B")(new Date(0, month - 1, 1)))
    );

  // Append the legend
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr(
      "transform",
      "translate(" + (width - 150) + "," + (height + 50) + ")"
    );

  // Set up a color scale for the legend
  const legendColorScale = d3
    .scaleOrdinal()
    .domain(d3.range(4))
    .range(["skyblue", "lightblue", "orange", "darkred"]);

  // Append rectangles to the legend
  legend
    .selectAll("rect")
    .data(d3.range(4))
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 30)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", 10)
    .attr("fill", (d, i) => legendColorScale(i));
});
