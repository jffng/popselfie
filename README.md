# Pop Selfie Camera
[View the Demo](https://jffng.github.io/popselfie)

## Original photo
One of my favorite places in San Francisco is the Exploratorium. This photo comes from an exhibit playing with shadows and light:
![](https://scontent-iad3-1.cdninstagram.com/t51.2885-15/e35/16789819_176935052797134_6328406333791928320_n.jpg)

## Sources
The camera capture diff-ing algorithm and design patterns borrow from [this source](http://codersblock.com/blog/motion-detection-with-javascript/).

## Next Steps

#### Features
  - Save out a still of the video capture
  - Ability to vary the colors 
  - Correspond pixel overlaps to true color / light spectrum

#### Optimizations
  - Draw using single canvas
  - Iterate over diff'd pixels once for alpha and rgb
