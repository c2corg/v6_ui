#!/bin/sh -e

REPO="c2corg/v6_ui"

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Not publishing docker images out of Pull Requests"
  exit 0
fi

publish_image() {
  local DOCKER_IMAGE
  DOCKER_IMAGE="$1"

  echo "Pushing image '${DOCKER_IMAGE}' to docker hub"
  docker push "${DOCKER_IMAGE}"
}

docker login -u "$DOCKER_USER" -p "$DOCKER_PASS"

if [ "$TRAVIS_BRANCH" = "master" ]; then
  publish_image "${REPO}:latest"
  publish_image "${REPO}:dev_environment"
elif [ ! -z "$TRAVIS_TAG" ]; then
  publish_image "${REPO}:${TRAVIS_TAG}"
elif [ ! -z "$TRAVIS_BRANCH" ]; then
  publish_image "${REPO}:${TRAVIS_BRANCH}"
else
  echo "Not pushing any image"
fi

