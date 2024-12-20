import json
from sklearn.metrics import confusion_matrix

### This file contains the definitions of the functions:
# test_confusion_matrices - matrices_to_json - predictions_list_to_json - predictions_numpy_to_json

# Function to test if the dimensions of the confusion matrices align with the number of classes
def test_confusion_matrices(class_names, confusion_matrices):
    first_matrix = list(confusion_matrices.values())[0]
    n = len(class_names)
    m = len(first_matrix)
    l = len(first_matrix[0])
    # If the number of classes does not align with the dimensions of the confusion matrix, raise an error
    if n != m or m != l:
        raise ValueError("Number of classes does not align with confusion matrices dimensions.")

# Function to write the class names and confusion matrices to a JSON file
def matrices_to_json(class_names, confusion_matrices, path_to_json):
    # Test if the dimensions of the confusion matrices align with the number of classes
    test_confusion_matrices(class_names, confusion_matrices)
    # Prepare the data to be written to the JSON file
    data = {
        'class_names': class_names,
        'confusion_matrices': confusion_matrices
    }
    # Open the file in write mode
    with open(path_to_json, 'w') as f:
        json.dump(data, f)

# Function to calculate confusion matrices from model predictions and write them to a JSON file
def predictions_list_to_json(class_names, model_predictions, path_to_file):
    if "verite" not in model_predictions:
        raise ValueError("True values are not present in data, can not calculate confusion matrices.")
    if len(model_predictions) == 1:
        raise ValueError("Not enough models in data.")
    
    confusion_matrices = {}
    for model_name, predictions in model_predictions.items():
        if model_name != "verite":
            # Calculate the confusion matrix for the model
            matrix = confusion_matrix(model_predictions["verite"], predictions, labels=class_names)
            confusion_matrices[model_name] = matrix.tolist()
    # Write the class names and confusion matrices to a JSON file
    matrices_to_json(class_names, confusion_matrices, path_to_file)
  
# Function to write the class names and model predictions to a JSON file  
def predictions_numpy_to_json(class_names, model_predictions, path_to_file):
    
    class_names = class_names.tolist()
    for model_name, predictions in model_predictions.items():
        model_predictions[model_name] = predictions.tolist()
    
    predictions_list_to_json(class_names, model_predictions, path_to_file)
