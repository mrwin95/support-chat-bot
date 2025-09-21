#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

set -a
source  "$SCRIPT_DIR/.env"
set +a

echo "Connecting to DB at $AWS_ACCOUNT_ID"

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
docker buildx build --platform linux/amd64,linux/arm64 -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_IMAGE_NAME:$IMAGE_TAG $SCRIPT_DIR/backend --push
#docker tag $BACKEND_IMAGE_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_IMAGE_NAME:$IMAGE_TAG
#docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_IMAGE_NAME:$IMAGE_TAG