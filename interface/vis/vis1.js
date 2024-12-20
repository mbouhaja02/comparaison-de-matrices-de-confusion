import { drawMatrix, createSvg, normalizeMatrix, makeSquare, createAxes, createZoom } from '../functions.js';

// Function to draw the visualization
export function drawVis(data, div, colorPicker, shouldNormalize, legend) {
    // Get the number of matrices per row from localStorage or use 'auto-fill'
    const numPerRow = localStorage.getItem('numPerRow') || 'auto-fill';

    // Set the scale ratio and calculate the grid size based on the container width
    const scaleRatio = 0.9;
    const containerWidth = parseFloat(getComputedStyle(div.node()).width);
    const gridSize = containerWidth / numPerRow * scaleRatio;

    // Set the display style and layout of the div container
    div.style("display", "grid")
        .style("grid-template-columns", `repeat(${numPerRow}, ${gridSize}px)`)
        .style("gap", "0px")
        .style("padding", "50px")
        .style("justify-content", "center")
        .style("align-items", "center");

    // Set the display style and layout of the legend container
    legend.style("display", "flex")
        .style("padding", "50px")
        .style("justify-content", "center")
        .style("align-items", "center");

    // Create a deep copy of the data
    let dataCopy = JSON.parse(JSON.stringify(data));

    // Create an array of numbers from 1 to class_names.length
    let class_names = dataCopy.class_names;
    let class_numbers = Array.from({ length: class_names.length }, (_, i) => i);

    // Create an empty object to store the square text elements
    let squareTextSet = {};

    // Normalize the confusion matrices if shouldNormalize is 'true'
    if (shouldNormalize === 'true') {
        for (let _ in dataCopy.confusion_matrices) {
            dataCopy.confusion_matrices[_] = normalizeMatrix(dataCopy.confusion_matrices[_]);
        }
    }

    // Iterate over each model in the data and create a visualization for each
    Object.keys(dataCopy.confusion_matrices).forEach((model) => {
        // Create a new div container for each model
        const newDiv = div.append("div")
            .attr("class", "svg-container")
            .style("border", "1px solid black");

        // Create an SVG element for each model
        const svg = createSvg(newDiv, model);

        // Create a group element for the matrix and apply a translation
        const g = svg.append("g").attr("transform", "translate(50, 60)");
        createZoom(g, svg);

        // Get the confusion matrix for the current model
        let confusionMatrix = dataCopy.confusion_matrices[model];
        let length = confusionMatrix.length;

        // Set the range of the scale to match the SVG width
        const scale = d3.scaleBand()
            .domain(d3.range(length))
            .range([0, 400]); // 400 for now until I can figure out how to get the good width

        // Create color scales for the confusion matrix
        const colorScale = createColorScale(confusionMatrix, colorPicker.value);
        const colorScale2 = colorScale; // dont mind this

        // Create a square text element for the current model
        let squareText = makeSquare(svg);
        squareTextSet[model] = squareText; // Add the square text to the set

        // Draw the confusion matrix and create axes
        drawMatrix(confusionMatrix, g, scale, squareTextSet, dataCopy, colorScale, colorScale2, createCell);
        createAxes(g, scale, class_numbers);
    });

    // Create a div for the legend
    const legendDiv = legend.append("div")
        .style("text-align", "center")
        .style("font-size", "18px")
        .style("display", "inline-block")
        .style("border", "2px solid black")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("margin-top", "10px");

    // Create legend items for each class
    for (let i = 0; i < class_names.length; i++) {
        legendDiv.append("span")
            .style("display", "inline-block")
            .style("width", "20px")
            .style("height", "20px")
            .style("background-color", colorPicker.value)
            .text(class_numbers[i] + 1)
            .style("color", d3.lab(colorPicker.value).l > 50 ? 'black' : 'white')
            .style("margin-right", "5px");

        legendDiv.append("span")
            .text(class_names[i])
            .style("margin-right", "15px");
    }

    // Return the number of matrices per row
    return numPerRow;
}

// Function to create a cell in the confusion matrix
export function createCell(cellGroup, scale, j, i, cell, squareTextSet, dataCopy, colorScale, invertedColorScale) {
    return cellGroup.append('rect')
        .attr('x', scale(i))
        .attr('y', scale(j))
        .attr('width', scale.bandwidth())
        .attr('height', scale.bandwidth())
        .style('fill', colorScale(cell))
        .classed(`row-${i}`, true)  // Add class for row
        .classed(`col-${j}`, true)  // Add class for column
        .on("mouseover", function () {
            d3.selectAll("rect:not(.square)").style("opacity", 0.2);  // Reduce opacity of all cells
            d3.selectAll("text:not(.square):not(.axes-text)").style("opacity", 0.2);  // Reduce opacity of all text except axes
            d3.selectAll(`.row-${i}, .row-${j}, .col-${i}, .col-${j}`).style("opacity", 1)  // Keep the opacity of the cells in the same row or column
                .style("stroke", "black")  // Add black stroke to cells in the same row or column
                .style("stroke-width", 2);  // Set stroke width
            d3.selectAll(`.row-${i}-text, .row-${j}-text, .col-${i}-text, .col-${j}-text, .title`).style("opacity", 1);

            // Update the text in the square with the cell value
            // add .toFixed(2)); to round to two decimal places
            for (let model in squareTextSet) {
                let otherCell = dataCopy.confusion_matrices[model][j][i];
                squareTextSet[model].text("Value: " + otherCell);
            }

        })
        .on("mouseout", function () {
            d3.selectAll("rect").style("opacity", 1)  // Reset opacity of all cells
            d3.selectAll(`.row-${i}, .row-${j}, .col-${i}, .col-${j}`).style("opacity", 1)  // Keep the opacity of the cells in the same row or column
                .style("stroke", null)  // Add black stroke to cells in the same row or column
                .style("stroke-width", null);  // Set stroke width
            d3.selectAll("text").style("opacity", 1);  // Reset opacity of all text

            // Clear the text in the square
            for (let model in squareTextSet) {
                squareTextSet[model].text("No Cell Selected");
            }
        });
}

// Function to create a color scale based on the matrix values
export function createColorScale(matrix, color) {
    // Get the minimum and maximum values from the matrix
    const domain = [
        d3.min(matrix, (row) => d3.min(row)),
        d3.max(matrix, (row) => d3.max(row))
    ];

    // Create a linear color scale from white to the specified color
    return d3.scaleLinear().domain(domain).range(["white", color]);
}