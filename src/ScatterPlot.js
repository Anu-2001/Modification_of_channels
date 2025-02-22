import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Select from "react-select";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import movieData from "./movie.json"; //import dataset

//define selectable options for x and y axes
const attributeOptions = [
  { value: "Budget", label: "budget" },
  { value: "us_gross", label: "us_Gross" },
  { value: "worldwide_gross", label: "Worldwide Gross" },
  { value: "rotten_rating", label: "rotten_Rating" },
  { value: "imdb_rating", label: "imdb_Rating" },
  { value: "imdb_votes", label: "imdb_Votes" }
];
//color options
const colorOptions = [
  { value: "none", label: "None" },
  { value: "genre", label: "Genre" },
  { value: "creative_type", label: "Creative Type" },
  { value: "source", label: "Source" },
  { value: "release", label: "Release Date" },
  { value: "rating", label: "Rating" }
];
//opacity and size options
const osOptions = [
  { value: "none", label: "None" },
  { value: "us_gross", label: "us_Gross" },
  { value: "worldwide_gross", label: "Worldwide Gross" },
  { value: "rotten_rating", label: "rotten_Rating" },
  { value: "imdb_rating", label: "imdb_Rating" },
  { value: "imdb_votes", label: "imdb_Votes" }
];

const MovieVis = () => {
  // States to manage selected attributes for scatter plot visualization
  const [xAxis, setXAxis] = useState(attributeOptions[4]);
  const [yAxis, setYAxis] = useState(attributeOptions[1]);
  const [colorBy, setColorBy] = useState(attributeOptions[5]);
  const [opacityBy, setOpacityBy] = useState(attributeOptions[3]);
  const [sizeBy, setSizeBy] = useState(attributeOptions[4]);
  const [highlightedData, setHighlightedData] = useState([]);

  useEffect(() => {
    // Effect Hook to redraw chart whenever selections change
    renderChart();
  }, [xAxis, yAxis, colorBy, opacityBy, sizeBy]);

  const renderChart = () => {
    // Remove any existing SVG elements before redrawing
    d3.select("#chart-area").selectAll("*").remove();

    const width = 900; //dimensions for the scatter plot
    const height = 700;

    const canvas = d3.select("#chart-area")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("border", "2px solid #ccc");

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(movieData, d => +d[xAxis.value])])
      .range([80, 820]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(movieData, d => +d[yAxis.value])])
      .range([620, 80]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const opacityScale = d3.scaleLinear()
      .domain([0, d3.max(movieData, d => +d[opacityBy.value])])
      .range([0.3, 1]);

    const sizeScale = d3.scaleLinear()
      .domain([0, d3.max(movieData, d => +d[sizeBy.value])])
      .range([6, 18]);

      // Plot each movie as a circle in the scatter plot
    canvas.selectAll("circle")
      .data(movieData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(+d[xAxis.value]))
      .attr("cy", d => yScale(+d[yAxis.value]))
      .attr("r", d => sizeScale(+d[sizeBy.value]))
      .attr("fill", d => colorScale(d[colorBy.value]))
      .attr("opacity", d => opacityScale(+d[opacityBy.value]))
      .attr("class", "data-point");

      //Append X-axis with formatted text
    canvas.append("g")
      .attr("transform", `translate(0, 620)`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "18px")
      .style("font-weight", "bold");

      //Append Y-axis with formatted text
    canvas.append("g")
      .attr("transform", "translate(80,0)")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "18px")
      .style("font-weight", "bold");
    //Enable brush selection to highlight data points
    const brush = d3.brush()
      .extent([[80, 80], [width - 80, height - 80]])
      .on("end", ({ selection }) => {
        if (selection) {
          const [[x0, y0], [x1, y1]] = selection;
          const selectedMovies = movieData.filter(d => {
            const x = xScale(+d[xAxis.value]);
            const y = yScale(+d[yAxis.value]);
            return x >= x0 && x <= x1 && y >= y0 && y <= y1;
          });
          setHighlightedData(selectedMovies);
        } else {
          setHighlightedData([]);
        }
      });
    //add brush interaction to the SVG
    canvas.append("g").call(brush);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "20px" }}>
      <h2>Movie Data Visualization</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", paddingBottom: "10px", fontWeight: "bold" }}>
        <label>X: <Select options={attributeOptions} value={xAxis} onChange={setXAxis} /></label>
        <label>Y: <Select options={attributeOptions} value={yAxis} onChange={setYAxis} /></label>
        <label>Color: <Select options={colorOptions} value={colorBy} onChange={setColorBy} /></label>
        <label>Opacity: <Select options={osOptions} value={opacityBy} onChange={setOpacityBy} /></label>
        <label>Size: <Select options={osOptions} value={sizeBy} onChange={setSizeBy} /></label>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "50px", alignItems: "flex-start" }}>
        <div id="chart-area" style={{ textAlign: "center" }}></div>
        <TableContainer component={Paper} style={{ maxWidth: "750px", border: "2px solid #ccc", padding: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ padding: "20px" }}><b>Title</b></TableCell>
                <TableCell style={{ padding: "20px" }}><b>Genre</b></TableCell>
                <TableCell style={{ padding: "20px" }}><b>Creative Type</b></TableCell>
                <TableCell style={{ padding: "20px" }}><b>Release</b></TableCell>
                <TableCell style={{ padding: "20px" }}><b>Rating</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {highlightedData.map((movie, index) => (
                <TableRow key={index}>
                  <TableCell style={{ padding: "20px" }}>{movie.title}</TableCell>
                  <TableCell style={{ padding: "20px" }}>{movie.genre}</TableCell>
                  <TableCell style={{ padding: "20px" }}>{movie.creative_type}</TableCell>
                  <TableCell style={{ padding: "20px" }}>{movie.release}</TableCell>
                  <TableCell style={{ padding: "20px" }}>{movie.rating}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default MovieVis;
