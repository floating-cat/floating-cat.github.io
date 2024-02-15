#!/bin/sh

docker run -p 4000:4000 -v "$(pwd):/site" docker.io/bretfisher/jekyll-serve
