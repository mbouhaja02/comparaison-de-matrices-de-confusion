import subprocess
import os
import re
from lib import make_json

### This file contains the definitions of the functions:
# launch_server - matrices_open_window - predictions_list_open_window - predictions_numpy_open_window

# Function to launch the server
def launch_server(path_to_html, html_file_name='index.html', install_req=False, os_type='linux'):
    # Check if the path to the HTML file is valid
    if not os.path.exists(path_to_html):
        raise ValueError("Invalid path to the HTML file.")
    
    # Check if the HTML file exists
    if not os.path.exists(html_file_name):  
        raise ValueError("HTML file does not exist.")
    
    # Change the working directory to the path of the HTML file
    os.chdir(path_to_html)
    
    # Install dependencies  
    if install_req==True:
        if os_type == 'linux':
            print('Installing dependencies...')
            subprocess.run('./install/install_on_ubuntu.sh', shell=True)
        elif os_type == 'windows':
            print('Installing dependencies...')
            subprocess.run('./install/install_on_windows.bat', shell=True)
        
    # Call server.js
    print('Starting server.js...')
    subprocess.Popen('node server.js &', shell=True)

    # Call live-server
    print('Starting live-server...')
    subprocess.Popen(f'live-server --entry-file={html_file_name} &', shell=True)
    
# Function to open a window displaying the confusion matrices
def matrices_open_window(class_names, confusion_matrices, path_to_html, path_to_file):
    make_json.matrices_to_json(class_names, confusion_matrices, path_to_file)
    launch_server(os.path.dirname(path_to_file))
    
# Function to open a window displaying the confusion matrices
def predictions_list_open_window(class_names, model_predictions, path_to_html, path_to_file):
    make_json.predictions_list_to_json(class_names, model_predictions, path_to_file)
    launch_server(os.path.dirname(path_to_file))
   
# Function to open a window displaying the confusion matrices 
def predictions_numpy_open_window(class_names, model_predictions, path_to_html, path_to_file):
    make_json.predictions_numpy_to_json(class_names, model_predictions, path_to_file)
    launch_server(os.path.dirname(path_to_file))
