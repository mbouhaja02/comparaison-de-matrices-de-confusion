let currentData = null;
let numberclass = 1 ;
// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const PORT = serverPort;
    const fileSelector = document.getElementById('fileSelector');
    const headerHeight = document.querySelector('header').offsetHeight;
    // Adjust the body margin to accommodate the header height
    document.body.style.marginTop = headerHeight + 'px';

    // Fetch the list of JSON files from the server
    fetch(`http://localhost:${PORT}/json-files`)
        .then(response => response.json())
        .then(files => {
            // Populate the file selector with the names of the files
            files.forEach(file => {
                const option = new Option(file, file);
                fileSelector.appendChild(option);
            });
            // Check localStorage for a previously selected file
            const savedFilePath = localStorage.getItem('selectedFilePath');
            if (savedFilePath) {
                fileSelector.value = savedFilePath;
            } else if (files.length > 0) {
                // If no file was previously selected, select the first file in the list
                fileSelector.value = files[0];
            }
            // Load the selected JSON file
            loadJSON(fileSelector.value);
        });

    // Event listener for when the selected file changes
    fileSelector.addEventListener('change', () => {
        // Save the selected file path to localStorage
        localStorage.setItem('selectedFilePath', fileSelector.value);
        // Load the newly selected JSON file
        loadJSON(fileSelector.value);
    });

    var color = localStorage.getItem('buttonColor');
    if (color) {
        setBackgroundColor(color);
    }
});

// Function to load a JSON file from the server
function loadJSON(filePath) {
    const PORT = serverPort;
    fetch(`http://localhost:${PORT}/${filePath}`)
        .then(response => response.json())
        .then(data => {
            // Save the loaded data and draw the confusion matrices
            currentData = data;
            drawConfusionMatrices();
        })
        .catch(error => console.error('Failed to load JSON file:', error));
}

// Function to draw the confusion matrices
function drawConfusionMatrices() {
    const div = d3.select("#confusion-matrices");
    const legend = d3.select("#legend");
    const colorPicker = document.getElementById('colorPicker') || localStorage.getItem('buttonColor');
    const visSelector = document.getElementById('visSelector');
    const shouldNormalize = document.getElementById('normalize').value;
    const selectedVis = visSelector.value;
    const visMapping = {
        'vis1': './vis/vis1.js',
        'vis2': './vis/vis2.js',
        'vis3': './vis/vis3.js',
        'vis4': './vis/vis4.js'
    };

    // Clear the existing confusion matrices and legend
    div.selectAll("div").remove();
    div.selectAll("svg").remove();
    div.selectAll("g").remove();
    legend.selectAll("div").remove();

    if (currentData) {
        import(visMapping[selectedVis])
            .then(module => {
                // Execute drawVis and store the return value
                numberclass = module.drawVis(currentData, div, colorPicker, shouldNormalize, legend);
                
                // Use the returned value
                console.log('Visualization details:', visualizationDetails);
            })
            .catch(error => console.error(`Error loading module: ${error}`));
    }

    // Redraw the visualization when UI controls change
    document.getElementById('colorPicker').addEventListener('change', drawConfusionMatrices);
    document.getElementById('visSelector').addEventListener('change', drawConfusionMatrices);
    document.getElementById('normalize').addEventListener('change', drawConfusionMatrices);
}

// Function to set the background color of various elements
function setBackgroundColor(color) {
    document.getElementById('download').style.backgroundColor = color;
    document.getElementById('normalize').style.backgroundColor = color;
    document.getElementById('visSelector').style.backgroundColor = color;
    document.getElementById('changePerRow').style.backgroundColor = color;
    document.getElementById('sort').style.backgroundColor = color;
    document.getElementById('fileSelector').style.backgroundColor = color;
    document.querySelector('label[for="colorPicker"]').style.backgroundColor = color;
}

// Event listener for when the color picker changes
document.getElementById('colorPicker').addEventListener('change', function () {
    var color = this.value;
    setBackgroundColor(color);
    localStorage.setItem('buttonColor', color);
});

// Event listener for when the 'change per row' button is clicked
document.getElementById('changePerRow').addEventListener('click', function () {
    var visSelected = document.getElementById('visSelector').value;
    if (visSelected === 'vis1') {
        // Prompt the user to enter the number of matrices per row
        var numPerRow = prompt("Enter the number of matrices per row:");
        document.getElementById('confusion-matrices').style.gridTemplateColumns = `repeat(${numPerRow}, 1fr)`;
        localStorage.setItem('numPerRow', numPerRow);
    } else {
        // Alert the user that this feature is only available for the first visualization
        alert('This feature is only available for the first visualisation.');
    }
});

// Function to export and download the SVG
function exportAndDownloadSVG() {
    const svgNS = "http://www.w3.org/2000/svg";
    const containerSVG = document.createElementNS(svgNS, "svg");
    let currentY = 0;  
    let currentX = 0;  
    let maxWidth = 0;  
    let maxHeight = 0; 
    let count = 0;     

   // Add a <style> element to include the necessary CSS styles
    const styleElement = document.createElementNS(svgNS, "style");
    document.querySelectorAll("style").forEach(style => {
        styleElement.textContent += style.textContent;
    });
    containerSVG.appendChild(styleElement);

    // Iterate over each SVG to clone, position, and adjust their positions
    document.querySelectorAll('svg:not(.square)').forEach((svg, index, array) => {
        const clone = svg.cloneNode(true);
        const bbox = svg.getBoundingClientRect();

        // Set dimensions based on the bounding box for better accuracyn
        clone.setAttribute("width", bbox.width);
        clone.setAttribute("height", bbox.height);
        clone.setAttribute("x", currentX);
        clone.setAttribute("y", currentY);

        // Update horizontal and vertical positions
        currentX += bbox.width;
        maxWidth = Math.max(maxWidth, currentX); 
        maxHeight = Math.max(maxHeight, bbox.height); 

        // Increment the counter and check if the row is complete
        count++;
        if (count >= numberclass) { 
            currentY += maxHeight;
            currentX = 0;
            count = 0;
            maxHeight = 0;  
        }

        containerSVG.appendChild(clone);
    });

     // Adjust the dimensions of the container SVG after placing all the SVGs
    containerSVG.setAttribute("width", maxWidth);
    containerSVG.setAttribute("height", currentY + maxHeight);
    containerSVG.setAttribute("viewBox", `0 0 ${maxWidth} ${currentY + maxHeight}`);

    // Serialization and download
    const serializer = new XMLSerializer();
    const source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(containerSVG);
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    // Create a link for downloading
    const link = document.createElement("a");
    link.href = url;
    link.download = "ExportSVG.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Add event listener to the 'download' button
document.getElementById('download').addEventListener('click', exportAndDownloadSVG);



// Event listener for when the 'sort' select box changes
document.getElementById("sort").addEventListener('change', function () {
    const PORT = serverPort;
    const filePath = fileSelector.value;

    fetch(`http://localhost:${PORT}/sort-matrices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath: filePath })
    })
    .then(response => response.json())
    .then(data => {
        if(data && data.filePath) {
            loadJSON(data.filePath);
        } else {
            console.error('Invalid data received:', data);
        }
    })
    .catch(error => console.error('Failed to sort matrices:', error));
});


