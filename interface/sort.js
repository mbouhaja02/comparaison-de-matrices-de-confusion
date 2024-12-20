const fs = require('fs');
const path = require('path');
const { Matrix } = require('ml-matrix');
const munkres = require('munkres-js');

// Define a distance measure
function distance(matrix1, matrix2) {
    let diff = Matrix.sub(matrix1, matrix2);
    return diff.norm();
}

// Create a zero matrix with specified rows and columns
function createZeroMatrix(rows, cols) {
    let matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix.push(new Array(cols).fill(0));
    }
    return new Matrix(matrix);
}

// Function to sort confusion matrices based on their distances
function sortConfusionMatrices(filePath) {
    // Read the JSON file
    const rawData = fs.readFileSync(filePath);
    const data = JSON.parse(rawData);

    // Get the names of the confusion matrices
    const names = Object.keys(data.confusion_matrices);

    // Create a distance matrix to store the distances between confusion matrices
    const distanceMatrix = createZeroMatrix(names.length, names.length);

    // Calculate the distances between each pair of confusion matrices
    for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < names.length; j++) {
            let matrix1 = new Matrix(data.confusion_matrices[names[i]]);
            let matrix2 = new Matrix(data.confusion_matrices[names[j]]);
            distanceMatrix.set(i, j, distance(matrix1, matrix2));
        }
    }

    // Apply the Munkres algorithm to find the optimal sorting order
    const result = munkres(distanceMatrix.to2DArray());

    // Get the sorted names based on the Munkres algorithm result
    const sortedNames = result.map(pair => names[pair[1]]);

    // Create a new object to store the sorted data
    const sortedData = {
        class_names: data.class_names,
        confusion_matrices: {}
    };

    // Populate the sorted data object with the sorted confusion matrices
    sortedNames.forEach(name => {
        sortedData.confusion_matrices[name] = data.confusion_matrices[name];
    });

    // Define the sorted file path
    const baseName = path.basename(filePath, '.json');
    const sortedFilePath = path.join(path.dirname(filePath), baseName.replace('_sorted', '') + '_sorted.json');

    // Overwrite the sorted file if it already exists, or create a new one if it does not
    fs.writeFileSync(sortedFilePath, JSON.stringify(sortedData, null, 2));

    // Return the sorted file path
    return sortedFilePath;
}

// Function to get the old file name (without the '_sorted' suffix)
function getOldFileName(filePath) {
    let baseName = path.basename(filePath, path.extname(filePath));
    if (baseName.endsWith('_sorted')) {
        baseName = baseName.slice(0, -7);
    }
    return baseName + path.extname(filePath);
}

// Export the sortConfusionMatrices function
module.exports = { sortConfusionMatrices };