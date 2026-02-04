#!/bin/bash
#
# ECS Deployment Script
#
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production
#

set -e

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${AWS_REGION:-us-east-1}
STACK_NAME="genetic-explorer-${ENVIRONMENT}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v aws >/dev/null 2>&1 || error "AWS CLI is not installed"
    command -v docker >/dev/null 2>&1 || error "Docker is not installed"
    
    aws sts get-caller-identity >/dev/null 2>&1 || error "AWS credentials not configured"
    
    log "Prerequisites OK"
}

# Build and push Docker image
build_and_push() {
    log "Building Docker image..."
    
    # Get ECR login token
    log "Logging in to ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Get ECR repository URI
    ECR_URI=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryURI`].OutputValue' \
        --output text \
        --region $AWS_REGION 2>/dev/null || echo "")
    
    if [ -z "$ECR_URI" ]; then
        error "ECR repository not found. Have you deployed the CloudFormation stack?"
    fi
    
    # Build image
    docker build -t genetic-explorer:latest ../../
    
    # Tag image
    IMAGE_TAG=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
    docker tag genetic-explorer:latest $ECR_URI:$IMAGE_TAG
    docker tag genetic-explorer:latest $ECR_URI:latest
    
    # Push image
    log "Pushing image to ECR..."
    docker push $ECR_URI:$IMAGE_TAG
    docker push $ECR_URI:latest
    
    log "Image pushed: $ECR_URI:$IMAGE_TAG"
    echo $IMAGE_TAG > .image_tag
}

# Deploy CloudFormation stack
deploy_stack() {
    log "Deploying CloudFormation stack: $STACK_NAME"
    
    # Check if stack exists
    STACK_EXISTS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $AWS_REGION 2>/dev/null && echo "yes" || echo "no")
    
    # Get parameters
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=isDefault,Values=true" \
        --query 'Vpcs[0].VpcId' \
        --output text \
        --region $AWS_REGION)
    
    PUBLIC_SUBNETS=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=map-public-ip-on-launch,Values=true" \
        --query 'Subnets[*].SubnetId' \
        --output text \
        --region $AWS_REGION | tr '\t' ',')
    
    PRIVATE_SUBNETS=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --query 'Subnets[*].SubnetId' \
        --output text \
        --region $AWS_REGION | tr '\t' ',' | cut -d',' -f1-2)
    
    CERT_ARN=$(aws acm list-certificates \
        --query 'CertificateSummaryList[0].CertificateArn' \
        --output text \
        --region $AWS_REGION)
    
    KMS_KEY_ID=$(aws kms list-keys \
        --query 'Keys[0].KeyId' \
        --output text \
        --region $AWS_REGION)
    
    # Read image tag
    IMAGE_TAG=$(cat .image_tag 2>/dev/null || echo "latest")
    
    if [ "$STACK_EXISTS" == "yes" ]; then
        log "Updating existing stack..."
        aws cloudformation update-stack \
            --stack-name $STACK_NAME \
            --template-body file://cloudformation.yaml \
            --parameters \
                ParameterKey=ImageTag,ParameterValue=$IMAGE_TAG \
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
            --region $AWS_REGION || {
                warn "No updates to perform or stack update in progress"
            }
    else
        log "Creating new stack..."
        aws cloudformation create-stack \
            --stack-name $STACK_NAME \
            --template-body file://cloudformation.yaml \
            --parameters \
                ParameterKey=VPCId,ParameterValue=$VPC_ID \
                ParameterKey=PublicSubnetIds,ParameterValue="$PUBLIC_SUBNETS" \
                ParameterKey=PrivateSubnetIds,ParameterValue="$PRIVATE_SUBNETS" \
                ParameterKey=CertificateArn,ParameterValue=$CERT_ARN \
                ParameterKey=KMSKeyId,ParameterValue=$KMS_KEY_ID \
                ParameterKey=ImageTag,ParameterValue=$IMAGE_TAG \
                ParameterKey=DesiredCount,ParameterValue=2 \
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
            --region $AWS_REGION
    fi
    
    log "Waiting for stack deployment..."
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $AWS_REGION 2>/dev/null || \
    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $AWS_REGION
    
    log "Stack deployment complete!"
}

# Update ECS service
update_service() {
    log "Updating ECS service..."
    
    CLUSTER_NAME=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`ECSClusterName`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    SERVICE_NAME=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`ECSServiceName`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    # Force new deployment
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --force-new-deployment \
        --region $AWS_REGION
    
    log "Waiting for service deployment..."
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --region $AWS_REGION
    
    log "Service updated successfully!"
}

# Main deployment
main() {
    log "Starting deployment for environment: $ENVIRONMENT"
    
    check_prerequisites
    build_and_push
    
    # Only deploy stack on first run or if --full-deploy is passed
    if [ "$2" == "--full-deploy" ] || [ ! -f .stack_deployed ]; then
        deploy_stack
        touch .stack_deployed
    fi
    
    update_service
    
    # Get ALB DNS
    ALB_DNS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`ALBDNS`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    log "Deployment complete!"
    log "Application URL: https://$ALB_DNS"
    log ""
    log "Health check: https://$ALB_DNS/api/health"
    log "Deep health: https://$ALB_DNS/api/health?type=deep"
}

# Execute main
main "$@"
