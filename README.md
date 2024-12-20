
Usage Guide

This project provides a Python library and an interactive web interface for visualizing and comparing confusion matrices generated from various supervised learning models. Follow this step-by-step guide to use the system effectively:


Step 1: Installing Dependencies

Open a terminal, navigate to the root directory of the project, and execute the appropriate installation script:

For Ubuntu:

./install/install_on_ubuntu.sh

For Windows (using PowerShell):

./install/install_on_windows.ps1

These scripts will install all necessary dependencies, including Python libraries and Node.js packages.


Step 2: Preparing the Data

Use the provided Python script make_json.py located in the lib directory to generate JSON files from your own supervised learning models. You can also place your JSON files containing the confusion matrices in the json directory.

Step 3: Launching the Server

To start the server and the interactive web interface, you have two options depending on your setup and preference:
Method 1: Using app.py

Launch the server directly from the app.py file, which will initiate both the backend server and the frontend interface. This method automatically serves the files located in the json directory. You can start the server with the following command:

python3 app.py

Method 2: Using make_window.py

For a more customized setup, you can start the server by calling one of the functions in the make_window.py Python script. These functions allow you to launch the interface specifying a JSON file or a set of confusion matrices in the form of numpy arrays or lists. 



Step 4: Visualizing Confusion Matrices

After both servers are started, you will be redirected to a web page accessible via the URL http://localhost${PORT}/. The port is randomly generated and then saved in the config.js file, allowing us to reuse it later to avoid any port availability issues.
On the web page, you will find several buttons allowing you to select the data for visualization, the desired type of visualization, colors, etc. You also have the option to sort the data using the built-in sorting algorithm. Additionally, we have enhanced interactivity through the use of the D3.js library in various visualizations, providing a more immersive and dynamic user experience.

Step 5: Exporting Results

To export the displayed visualizations in SVG format, click on the "Export Matrices" button. An SVG file will be downloaded, containing the confusion matrices as displayed on the screen.



Authors:

Badr EL HABTI, Mohammed BOUHAJA, Mohamed Reda EL KHADER
Hamza BAAKILI, Théodore JANKOWIAK, Khawla EL MAZOUGI, Mohamed Dyae CHALLAF