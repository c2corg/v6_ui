#!/bin/sh -e

REPO="c2corg/v6_ui"

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Not building docker images out of Pull Requests"
  exit 0
fi

build_image() {
  local DOCKER_TAG DOCKER_FILE
  DOCKER_TAG="$1"
  DOCKER_FILE="$3"

  echo "Building docker image '${DOCKER_TAG}'"
  docker build -f "${DOCKER_FILE}" -t "${DOCKER_TAG}" .
  docker inspect "${DOCKER_TAG}"
  docker history "${DOCKER_TAG}"
}

git archive --format=tar --output project.tar "$TRAVIS_COMMIT"

if [ "$TRAVIS_BRANCH" = "master" ]; then
  build_image "${REPO}:latest" Dockerfile
  build_image "${REPO}:dev_environment" Dockerfile_dev_environment
elif [ ! -z "$TRAVIS_TAG" ]; then
  build_image "${REPO}:${TRAVIS_TAG}" Dockerfile
elif [ ! -z "$TRAVIS_BRANCH" ]; then
  build_image "${REPO}:${TRAVIS_BRANCH}" Dockerfile
else
  echo "Don't know how to build image"
  exit 1
fi

