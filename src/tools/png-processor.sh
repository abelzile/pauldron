#!/bin/bash
# png-processor.sh - use imagemagick and pngout to resize an image to smallest power of 2 for each dimension and then compress.

# trim transparent pixels
IFS=" x+" read a b c d < <(convert "$1" -format "%@" info:)
#echo $a
#echo $b
#echo $c
#echo $d

x=$((a + c))
y=$((b + d))

dims="${x}x${y}+0+0"

convert "$1" -crop ${dims} +repage "$1"

# store width and height calculations (see http://www.fmwconcepts.com/imagemagick/tidbits/image.php#power2_pad)
p2w=$(convert "$1" -format "%[fx:2^(ceil(log(w)/log(2)))]" info:)
p2h=$(convert "$1" -format "%[fx:2^(ceil(log(h)/log(2)))]" info:)

# pad to power of 2
convert "$1" -background transparent -gravity NorthWest -extent ${p2w}x${p2h} "$1"

# compress
pngout-static -q -y "$1"

