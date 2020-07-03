#!/bin/bash
# png-processor.sh - use imagemagick and pngout to resize an image to smallest power of 2 for each dimension and then compress.

# get image dimensions
IFS=" x+" read a b c d < <(convert "$1" -format "%@" info:)
#echo $a
#echo $b
#echo $c
#echo $d

# build imagemagick crop param
x=$((a + c))
y=$((b + d))
dims="${x}x${y}+0+0"

mogrify -crop ${dims} +repage "$1"

# store power of 2 width and height calculations (see http://www.fmwconcepts.com/imagemagick/tidbits/image.php#power2_pad)
p2w=$(convert "$1" -format "%[fx:2^(ceil(log(w)/log(2)))]" info:)
p2h=$(convert "$1" -format "%[fx:2^(ceil(log(h)/log(2)))]" info:)

# pad to power of 2
mogrify -background transparent -gravity NorthWest -extent ${p2w}x${p2h} "$1"

# compress
pngout-static -q -y "$1"

