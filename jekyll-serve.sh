#!/bin/sh

docker run --rm -p 4000:4000 -v "$(pwd):/site" docker.io/bretfisher/jekyll-serve
