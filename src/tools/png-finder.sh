#!/bin/bash
# png-finder.sh - find all pngs in a directory and sub-directories and pass them to the processor.

find "$1" -name "*.png" -type f -exec ./png-processor.sh "{}" ';'
