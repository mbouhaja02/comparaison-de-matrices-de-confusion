import { drawMatrix, createSvg, normalizeMatrix, makeSquare, createAxes, createZoom } from '../functions.js';

// Main function to draw the visualization
export function drawVis(data, div, colorPicker, shouldNormalize, legend) {
    // Create a deep copy of the data
    let dataCopy = JSON.parse(JSON.stringify(data));
    
    // Normalize the confusion matrices if shouldNormalize is 'true'
    if (shouldNormalize === 'true') {
        for (let _ in dataCopy.confusion_matrices) {
            dataCopy.confusion_matrices[_] = normalizeMatrix(dataCopy.confusion_matrices[_]);
        }
    }

    // Get the models and number of models
    const models = Object.keys(dataCopy.confusion_matrices);
    const numModels = models.length;

    // Set the CSS grid layout for the visualization
    const scale = 0.9;
    const containerWidth = parseFloat(getComputedStyle(div.node()).width);
    const gridSize = containerWidth / numModels * scale;

    div.style("display", "grid")
        .style("grid-template-columns", `repeat(${numModels}, ${gridSize}px)`)
        .style("gap", "0px")
        .style("padding", "50px")
        .style("justify-content", "center")
        .style("align-items", "center");

    legend.style("display", "flex")
        .style("padding", "50px")
        .style("justify-content", "center")
        .style("align-items", "center");

    // Create a list of numbers from 1 to class_names.length
    let class_names = dataCopy.class_names;
    let class_numbers = Array.from({ length: class_names.length }, (_, i) => i);

    // Object to store square text elements for each model pair
    let squareTextSet = {};

    // Iterate over each pair of models to render their comparison or individual matrix
    models.forEach((modelRow, i) => {
        models.forEach((modelCol, j) => {
            // Check if the current cell is on the diagonal (self-comparison)
            const isDiagonal = (i === j);
            
            // Create a new div for each comparison matrix
            const title = isDiagonal ? modelRow : `${modelRow} (minus) ${modelCol}`;
            const newDiv = div.append("div")
                .attr("class", "svg-container")
                .style("border", "1px solid black");
            const svg = createSvg(newDiv, title);
            const g = svg.append("g").attr("transform", "translate(50, 60)");

            createZoom(g, svg);

            // Use original matrix for diagonal; compare matrices otherwise
            const matrix = isDiagonal ? dataCopy.confusion_matrices[modelRow] : compareMatrices(dataCopy.confusion_matrices[modelRow], dataCopy.confusion_matrices[modelCol]);
            const scale = d3.scaleBand().domain(d3.range(matrix.length)).range([0, 400]);
            const colorScale = createColorScale(matrix);
            const invertedColorScale = invertedColorScaleV4(matrix);

            // Create a square text element for the model pair
            let squareText = makeSquare(svg);
            squareTextSet[`${modelRow},${modelCol}`] = squareText;

            // Draw the matrix with appropriate settings
            drawMatrix(matrix, g, scale, squareTextSet, dataCopy, colorScale, invertedColorScale, createCell);
            
            // Draw axes with labels based on class names
            createAxes(g, scale, class_numbers);
        });
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

    // Add legend items for each class
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

    return numModels;
}

// Function to create a cell in the confusion matrix
export function createCell(cellGroup, scale, j, i, cell, squareTextSet, dataCopy, colorScale, invertedColorScale) {
    // Create a cell rectangle
    let createdCell = cellGroup.append('rect')
        .attr('x', scale(i))
        .attr('y', scale(j))
        .attr('width', scale.bandwidth())
        .attr('height', scale.bandwidth())
        .classed(`row-${i}`, true)  // Add class for row
        .classed(`col-${j}`, true)  // Add class for column
        .on("mouseover", function () {
            // Reduce opacity of all cells and text on mouseover
            d3.selectAll("rect:not(.square)").style("opacity", 0.2);
            d3.selectAll("text:not(.square):not(.axes-text)").style("opacity", 0.2);
            
            // Keep the opacity of the cells in the same row or column
            d3.selectAll(`.row-${i}, .row-${j}, .col-${i}, .col-${j}`).style("opacity", 1)
                .style("stroke", "black")  // Add black stroke to cells in the same row or column
                .style("stroke-width", 2);  // Set stroke width
            
            // Keep the opacity of the text in the same row or column and the title
            d3.selectAll(`.row-${i}-text, .row-${j}-text, .col-${i}-text, .col-${j}-text, .title`).style("opacity", 1);
            
            // Update the square text with the cell value for each model pair
            for (let key in squareTextSet) {
                let [modelRow, modelCol] = key.split(',');
                const isDiagonal = (modelRow === modelCol);
                const matrix = isDiagonal ? dataCopy.confusion_matrices[modelRow] : compareMatrices(dataCopy.confusion_matrices[modelRow], dataCopy.confusion_matrices[modelCol]);
                let otherCell = matrix[j][i];
                squareTextSet[key].text("Value: " + otherCell);
            }
        })
        .on("mouseout", function () {
            // Reset opacity of all cells and text on mouseout
            d3.selectAll("rect").style("opacity", 1)
            d3.selectAll(`.row-${i}, .row-${j}, .col-${i}, .col-${j}`).style("opacity", 1)
                .style("stroke", null)
                .style("stroke-width", null);
            d3.selectAll("text").style("opacity", 1);
            
            // Clear the square text for each model pair
            for (let key in squareTextSet) {
                squareTextSet[key].text("No Cell Selected");
            }
        });
    
    // Set the fill color based on the cell value and the color scale
    if (i === j) {
        createdCell.style('fill', colorScale(cell));
    } else {
        createdCell.style('fill', invertedColorScale(cell));
    }
    
    return createdCell;
}

// Function to compare two matrices by computing their difference
function compareMatrices(matrixA, matrixB) {
    return matrixA.map((row, i) => row.map((cell, j) => cell - matrixB[i][j]));
}

// Function to create a color scale ranging from red to green, centered on zero
function createColorScale(matrix) {
    const min = d3.min(matrix, row => d3.min(row));
    const max = d3.max(matrix, row => d3.max(row));
    return d3.scaleLinear().domain([min, 0, max]).range(["red", "white", "green"]);
}

// Function to create an inverted color scale for the comparison matrices
function invertedColorScaleV4(matrix) {
    const min = d3.min(matrix, row => d3.min(row));
    const max = d3.max(matrix, row => d3.max(row));
    return d3.scaleLinear().domain([min, 0, max]).range(["green", "white", "red"]);
}