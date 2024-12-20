// Function to draw the visualizations of confusion matrices
export function drawVis(data, div, colorPicker, shouldNormalize, legend) {
    // Set the padding and layout for the div and legend containers
    div.style("padding", "50px");
    legend.style("display", "flex")
        .style("padding", "50px")
        .style("justify-content", "center")
        .style("align-items", "center");

    // Get the model names and number of classes
    const models = Object.keys(data.confusion_matrices);
    const numClasses = data.confusion_matrices[models[0]].length;

    // Create a color palette using D3's scaleOrdinal and schemeCategory10
    const randomColor = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(models);

    // Calculate the size of the grid cell based on the container width and scale
    const scale = 0.9;
    const containerWidth = parseFloat(getComputedStyle(div.node()).width);
    const gridSize = containerWidth / numClasses * scale;

    // Add a checkbox for determining if colors are random
    const checkboxDiv = div.append("div")
        .style("text-align", "center")
        .style("padding-bottom", "10px");

    const checkbox = checkboxDiv.append("input")
        .attr("type", "checkbox")
        .attr("id", "randomColorCheckbox")
        .style("margin-right", "5px");

    checkboxDiv.append("label")
        .attr("for", "randomColorCheckbox")
        .text("Use Random Colors");

    // Create a div for the metamatrix
    const matrixDiv = div.append("div")
        .style("display", "grid")
        .style("grid-template-columns", `repeat(${numClasses}, ${gridSize}px)`)
        .style("grid-template-rows", `repeat(${numClasses}, ${gridSize}px)`)
        .style("gap", "2px")
        .style("justify-content", "center")
        .style("justify-items", "center")
        .style("align-items", "center");

    // Create a div for the legend
    const legendDiv = legend.append("div")
        .style("text-align", "center")
        .style("font-size", "18px")
        .style("display", "inline-block")
        .style("border", "2px solid black")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("margin-top", "10px");

    // Find the maximum value in all matrices
    let maxValue = 0;
    models.forEach(model => {
        const confusionMatrix = data.confusion_matrices[model];
        confusionMatrix.forEach(row => {
            maxValue = Math.max(maxValue, ...row);
        });
    });

    // Function to render the matrix
    function renderMatrix() {
        const useRandomColors = checkbox.property("checked");

        // Clear the matrix div before re-rendering
        matrixDiv.selectAll("*").remove();

        // Render the matrix cells
        for (let i = 0; i < numClasses; i++) {
            for (let j = 0; j < numClasses; j++) {
                const newDiv = matrixDiv.append("div")
                    .attr("class", "visualisation-container")
                    .style("width", `${gridSize}px`)
                    .style("height", `${gridSize}px`)
                    .style("border", "1px solid black");

                const comparisonData = models.map(model => ({
                    model,
                    value: data.confusion_matrices[model][i][j]
                }));

                // Display the comparison chart for each cell
                displayComparisonChart(newDiv, comparisonData, colorPicker, randomColor, checkbox, gridSize, maxValue);
            }
        }

        // Update the legend
        updateLegend(useRandomColors);
    }

    // Function to update the legend
    function updateLegend(useRandomColors) {
        // Clear the legend div before updating
        legendDiv.selectAll("*").remove();

        // Update the legend based on random colors or the selected color
        if (useRandomColors) {
            let x = 1;
            models.forEach(model => {
                legendDiv.append("span")
                    .style("display", "inline-block")
                    .style("width", "20px")
                    .style("height", "20px")
                    .style("background-color", randomColor(model))
                    .text(x)
                    .style("color", d3.lab(randomColor(model)).l > 50 ? 'black' : 'white')
                    .style("margin-right", "5px");

                legendDiv.append("span")
                    .text(model)
                    .style("margin-right", "15px");
                x++;
            });
        } else {
            let x = 1;
            models.forEach(model => {
                legendDiv.append("span")
                    .style("display", "inline-block")
                    .style("width", "20px")
                    .style("height", "20px")
                    .style("background-color", colorPicker.value)
                    .text(x)
                    .style("color", d3.lab(colorPicker.value).l > 50 ? 'black' : 'white')
                    .style("margin-right", "5px");

                legendDiv.append("span")
                    .text(model)
                    .style("margin-right", "15px");
                x++;
            });
        }
    }

    // Initial render of the matrix
    renderMatrix();

    // Add event listener for the checkbox
    checkbox.on("change", () => {
        renderMatrix();
    });

    // Return the number of classes
    return numClasses;
}

// Function to display the comparison chart for each cell
function displayComparisonChart(container, data, colorPicker, randomColor, checkbox, gridSize, maxValue) {
    // Set the margin and calculate the width and height of the chart
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };
    const width = gridSize - margin.left - margin.right;
    const height = gridSize - margin.top - margin.bottom;

    // Check if the user wants random colors
    const useRandomColors = checkbox.property("checked");

    // Create scales for the X and Y axes
    const xScale = d3.scaleBand()
        .domain(data.map((d, index) => index + 1))
        .rangeRound([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([height, 0]);

    // Create the SVG container for the chart
    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create the X and Y axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5));

    // Create a tooltip for displaying model names and values
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "lightgrey")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Add bars for the models
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d, index) => xScale(index + 1))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.value))
        .attr("fill", d => useRandomColors ? randomColor(d.model) : colorPicker.value);

    // Add invisible rectangles over each bar for hover interactions
    svg.selectAll(".bar-area")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar-area")
        .attr("x", (d, index) => xScale(index + 1))
        .attr("y", 0)
        .attr("width", xScale.bandwidth())
        .attr("height", height)
        .style("fill", "transparent")
        .on("mouseover", function (event, d) {
            // Show the tooltip on mouseover
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html(`${d.model}: ${d.value}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
            d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
        })
        .on("mousemove", function (event, d) {
            // Update the position of the tooltip on mousemove
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            // Hide the tooltip on mouseout
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this).attr("stroke", null);
        });
}