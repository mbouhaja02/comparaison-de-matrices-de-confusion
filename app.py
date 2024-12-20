import subprocess

# Call server.js
print('Starting server.js...')
subprocess.Popen('node server.js &', shell=True)

# Call live-server
print('Starting live-server...')
subprocess.Popen(f'live-server --entry-file=index.html &', shell=True)