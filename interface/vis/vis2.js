import { createZoom, createSvg, normalizeMatrix } from '../functions.js';
import { createColorScale } from './vis1.js'; 

// Function to draw the visualization
export function drawVis(data, div, colorPicker, shouldNormalize, legend) {
    const numClasses = data.class_names.length;
    const numModels = Object.keys(data.confusion_matrices).length;

    // Set the scale ratio and calculate the grid size based on the container width
    const scaleRatio = 0.9;
    const containerWidth = parseFloat(getComputedStyle(div.node()).width);
    const gridSize = containerWidth / numClasses * scaleRatio;

    // Set the display style and layout of the div container
    div.style("display", "grid")
        .style("grid-template-columns", `repeat(${numClasses}, ${gridSize}px)`)
        .style("gap", "0px")
        .style("padding", "50px")
        .style("justify-content", "center")
        .style("align-items", "center");

    // Set the display style and layout of the legend container
    legend.style("display", "flex")
        .style("padding", "50px")
        .style("justify-content", "center")
        .style("align-items", "center");

    // Adjust the size of the grid if the number of models is not a perfect square
    let size = Math.sqrt(numModels);
    if (size !== Math.floor(size)) {
        size = Math.floor(size) + 1;
    }

    // Create a deep copy of the data
    let dataCopy = JSON.parse(JSON.stringify(data));
    // Normalize the confusion matrices if shouldNormalize is 'true'
    if (shouldNormalize === 'true') {
        for (let _ in dataCopy.confusion_matrices) {
            dataCopy.confusion_matrices[_] = normalizeMatrix(dataCopy.confusion_matrices[_]);
        }
    }

    // Initialize an array to store the meta-matrices
    const numCols = size;
    const numRows = Math.ceil(numModels / numCols);

    let metaMatrixs = Array.from({ length: numClasses * numClasses }, () =>
        Array.from({ length: numRows }, () => Array.from({ length: numCols }))
    );

    // Get the keys of the confusion matrices
    const keys = Object.keys(dataCopy.confusion_matrices);

    // Populate the meta-matrices with the corresponding values from the confusion matrices
    for (let y = 0; y < numClasses * numClasses; y++) {
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                let index = i * numCols + j;
                if (index >= numModels) {
                    continue;
                }
                let model = keys[index];
                let matrix = dataCopy.confusion_matrices[model];
                metaMatrixs[y][i][j] = matrix[Math.floor(y / numClasses)][y % numClasses];
            }
        }
    }

    // Flatten the 3D array into a 2D array
    let flattenedMatrix = metaMatrixs.reduce((acc, val) => acc.concat(val), []);

    // Create a color scale based on the flattened matrix values
    const colorScale = createColorScale(flattenedMatrix, colorPicker.value);

    // Draw the meta-matrices
    metaMatrixs.forEach((metaMatrix, i) => {
        const newDiv = div.append("div")
            .attr("class", "svg-container")
            .style("border", "1px solid black");

        // Set the title for each meta-matrix
        let title = "Row Class " + Math.floor(i / numClasses) + ", Col Class " + i % numClasses;
        const svg = createSvg(newDiv, title);
        const g = svg.append("g").attr("transform", "translate(50, 90)");
        createZoom(g, svg);

        // Create scales for the x and y axes
        const xScale = d3.scaleBand()
            .domain(d3.range(numCols))
            .range([0, 400]);

        const yScale = d3.scaleBand()
            .domain(d3.range(numRows))
            .range([0, 400]);

        // Draw the matrix for each meta-matrix
        drawMatrix(metaMatrix, g, xScale, yScale, colorScale);
    });

    // Create a legend grid to display the model names
    const legendGrid = legend.append("div")
        .style("text-align", "center")
        .style("font-size", "16px")
        .style("display", "flex")
        .style("flex-wrap", "wrap")
        .style("border", "2px solid black")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("margin-top", "10px");

    // Calculate the square size for each model in the legend
    let squareSize = `${100 / size}%`;

    // Add each model name to the legend grid
    for (let i = 0; i < keys.length; i++) {
        let model = keys[i];
        let div = legendGrid.append("div")
            .style("width", squareSize)
            .style("height", squareSize)
            .style("padding", "5px")
            .style("text-align", "center")
            .style("box-sizing", "border-box")
            .text(model);

        // Add margin-bottom to the div if it's the last model in a row
        if ((i + 1) % size === 0) {
            div.style("margin-bottom", "10px");
        }
    }

    // Return the number of classes
    return numClasses;
}

// Function to draw a matrix
export function drawMatrix(matrix, g, xScale, yScale, colorScale) {
    // Draw the cells of the matrix
    matrix.forEach((row, i) => {
        row.forEach((cell, j) => {
            const cellGroup = g.append("g");
            createCell(cellGroup, xScale, yScale, i, j, colorScale, cell);
        });
    });

    // Add text to the cells
    matrix.forEach((row, i) => {
        row.forEach((cell, j) => {
            const cellColor = colorScale(cell);
            const textColor = d3.lab(cellColor).l > 50 ? 'black' : 'white';

            const numDigits = cell.toString().length;
            const maxFontSize = xScale.bandwidth() / numDigits;
            let fontSize = Math.min(yScale.bandwidth() / 2, maxFontSize);

            // Create a temporary text element to measure the width of the text
            const tempText = g.append("text")
                .style("font-size", `${fontSize}px`)
                .text(cell);
            while (tempText.node().getBBox().width > xScale.bandwidth() && fontSize > 0) {
                fontSize--;
                tempText.style("font-size", `${fontSize}px`);
            }
            tempText.remove();

            // Add the text to the cell
            g.append("text")
                .attr("x", xScale(j) + xScale.bandwidth() / 2)
                .attr("y", yScale(i) + yScale.bandwidth() / 2)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style("pointer-events", "none")
                .classed(`row-${i}-text`, true)
                .classed(`col-${j}-text`, true)
                .style("fill", textColor)
                .style("font-size", `${fontSize}px`)
                .text(cell);
        });
    });
}

// Function to create an individual cell in the matrix
export function createCell(cellGroup, xScale, yScale, i, j, colorScale, cell) {
    return cellGroup.append('rect')
        .attr('x', xScale(j))
        .attr('y', yScale(i))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .style('fill', colorScale(cell));
}