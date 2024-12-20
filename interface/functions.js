export function drawMatrix(matrix, g, scale, squareTextSet, dataCopy, colorScale, invertedColorScale, createCell) {
    // Add cells to the matrix
    matrix.forEach((row, i) => {
        row.forEach((cell, j) => {
            // Create a group for each cell and call the createCell function
            const cellGroup = g.append("g");
            createCell(cellGroup, scale, i, j, cell, squareTextSet, dataCopy, colorScale, invertedColorScale);
        });
    });

    // Add text to the cells
    matrix.forEach((row, i) => {
        row.forEach((cell, j) => {
            // Determine the color of the cell and the corresponding text color
            const cellColor = colorScale(cell);
            const textColor = d3.lab(cellColor).l > 50 ? 'black' : 'white';

            // Determine the font size based on the number of digits in the cell value
            const numDigits = cell.toString().length;
            const maxFontSize = scale.bandwidth() / numDigits;
            let fontSize = Math.min(scale.bandwidth() / 2, maxFontSize);

            // Create a temporary text element to measure the width of the text
            const tempText = g.append("text")
                .style("font-size", `${fontSize}px`)
                .text(cell);
            // Decrease the font size until the text fits within the cell
            while (tempText.node().getBBox().width > scale.bandwidth() && fontSize > 0) {
                fontSize--;
                tempText.style("font-size", `${fontSize}px`);
            }
            tempText.remove();

            // Add the text to the cell
            g.append("text")
                .attr("x", scale(j) + scale.bandwidth() / 2)
                .attr("y", scale(i) + scale.bandwidth() / 2)
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

export function createSvg(newDiv, title) {
    // Create an SVG element and set its dimensions
    const svg = newDiv.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 500 550`);

    // Add a title to the SVG
    svg.append("text")
        .attr("x", "50%")
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .classed("title", true)
        .text(title);

    return svg;
}

export function normalizeMatrix(matrix) {
    // Normalize each row of the matrix so that it sums to 1
    return matrix.map((row) => {
        const sum = d3.sum(row);
        return row.map((cell) => cell / sum);
    });
}

export function createAxes(g, scale, class_numbers) {
    // Create the x and y axes
    const xAxis = d3.axisTop(scale).tickFormat((d) => class_numbers[d] + 1);
    const yAxis = d3.axisLeft(scale).tickFormat((d) => class_numbers[d] + 1);

    // Add the axes to the group
    g.append("g").attr("class", "axes").call(xAxis)
        .selectAll("text")
        .attr("class", "axes-text");

    g.append("g").attr("class", "axes").call(yAxis)
        .selectAll("text")
        .attr("class", "axes-text");
}

export function createZoom(g, svg) {
    // Create a zoom behavior
    var zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", (event) => {
            // Apply the zoom transform to the group
            g.attr("transform", event.transform);
        });

    // Apply the zoom behavior to the SVG
    svg.call(zoom);
}

export function makeSquare(svg, defaultText = "No Cell Selected") {
    // Create a group for the square
    let squareGroup = svg.append("svg")
        .attr("class", "square")
        .style("opacity", 1)
        .attr("transform", "translate(150, 480)");

    // Add a rectangle to the group
    let square = squareGroup.append("rect")
        .attr("class", "square")
        .attr("width", 220)
        .attr("height", 50) 
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Append a text element to the squareGroup
    return squareGroup.append("text")
        .attr("class", "square")
        .attr("x", 110)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("fill", "black")
        .text(defaultText);
}