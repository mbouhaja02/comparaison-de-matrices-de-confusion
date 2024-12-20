# Adds higher directory to python modules path
import sys
sys.path.append(".")
sys.path.append("..")

from lib import make_window

def main():
    make_window.launch_server(".", 'index.html')

if __name__ == "__main__":
    main()