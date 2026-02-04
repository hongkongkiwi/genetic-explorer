# Amazon ECS Deployment Guide

Complete guide for deploying Genetic Explorer on Amazon ECS with Fargate.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Infrastructure Setup](#infrastructure-setup)
5. [Application Deployment](#application-deployment)
6. [Auto Scaling](#auto-scaling)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security](#security)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
Internet
    │
    ▼
┌─────────────────────────┐
│   Application Load      │
│      Balancer (ALB)     │
│   - HTTPS termination   │
│   - Health checks       │
└───────────┬─────────────┘
            │
    ┌───────┼───────┐
    │       │       │
    ▼       ▼       ▼
┌──────┐ ┌──────┐ ┌──────┐
│ ECS  │ │ ECS  │ │ ECS  │
│Task 1│ │Task 2│ │Task 3│
│Fargate│ │Fargate│ │Fargate│
└──┬───┘ └──┬───┘ └──┬───┘
   │        │        │
   └────────┼────────┘
            │
    ┌───────▼────────┐
    │     EFS        │
    │  (Shared FS)   │
    │ - SQLite DB    │
    │ - Uploads      │
    └────────────────┘
            │
    ┌───────▼────────┐
    │   Secrets      │
    │   Manager      │
    └────────────────┘
```

### Components

- **ECS Cluster**: Container orchestration with Fargate
- **ALB**: Application Load Balancer with HTTPS
- **EFS**: Elastic File System for shared storage
- **CloudWatch**: Logs and metrics
- **Secrets Manager**: Secure secret storage
- **KMS**: Encryption key management

---

## Prerequisites

### AWS Requirements

1. **AWS Account** with appropriate limits:
   - ECS Fargate: At least 10 tasks
   - EFS: 1 file system
   - ALB: 1 load balancer
   - ECR: 1 repository

2. **AWS CLI** installed and configured:
   ```bash
   aws configure
   aws sts get-caller-identity
   ```

3. **Docker** installed locally

4. **Domain name** with Route 53 (optional, for custom domain)

### Required IAM Permissions

Your AWS user/role needs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "ecs:*",
        "ecr:*",
        "elasticloadbalancing:*",
        "ec2:*",
        "elasticfilesystem:*",
        "logs:*",
        "secretsmanager:*",
        "kms:*",
        "iam:*",
        "autoscaling:*",
        "sns:*",
        "acm:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Quick Start

### 1. Clone and Build

```bash
git clone https://github.com/yourorg/genetic-explorer.git
cd genetic-explorer

# Build Docker image
docker build -t genetic-explorer:latest .
```

### 2. Configure Secrets

```bash
# Create secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name genetic-explorer/encryption-master-key \
  --secret-string "your-32-char-encryption-key"

aws secretsmanager create-secret \
  --name genetic-explorer/session-secret \
  --secret-string "your-session-secret"

aws secretsmanager create-secret \
  --name genetic-explorer/kms-key-id \
  --secret-string "your-kms-key-id"
```

### 3. Deploy Infrastructure

```bash
cd deploy/ecs

# Deploy full infrastructure
./deploy.sh production --full-deploy

# Or deploy just the application update
./deploy.sh production
```

### 4. Verify Deployment

```bash
# Get ALB DNS
ALB_DNS=$(aws cloudformation describe-stacks \
  --stack-name genetic-explorer-production \
  --query 'Stacks[0].Outputs[?OutputKey==`ALBDNS`].OutputValue' \
  --output text)

# Check health
curl https://$ALB_DNS/api/health
```

---

## Infrastructure Setup

### VPC Configuration

The CloudFormation template requires:
- 1 VPC
- 2+ Public subnets (for ALB)
- 2+ Private subnets (for ECS tasks)
- Internet Gateway
- NAT Gateway (for private subnet outbound)

If you don't have a VPC set up:

```bash
# Use AWS VPC Wizard or CloudFormation:
aws cloudformation create-stack \
  --stack-name genetic-explorer-vpc \
  --template-url https://s3.amazonaws.com/cloudformation-templates-us-east-1/vpc.yaml \
  --parameters ParameterKey=EnvironmentName,ParameterValue=genetic-explorer
```

### SSL Certificate

For HTTPS, you need an ACM certificate:

```bash
# Request certificate
aws acm request-certificate \
  --domain-name genetic-explorer.example.com \
  --validation-method DNS \
  --subject-alternative-names www.genetic-explorer.example.com

# Follow DNS validation instructions
aws acm describe-certificate \
  --certificate-arn <arn> \
  --query 'Certificate.DomainValidationOptions'
```

### KMS Key

Create a KMS key for encryption:

```bash
aws kms create-key \
  --description "Genetic Explorer encryption key" \
  --key-usage ENCRYPT_DECRYPT \
  --origin AWS_KMS
```

---

## Application Deployment

### Manual Deployment

```bash
# Deploy with specific image tag
./deploy.sh production

# View deployment status
aws ecs describe-services \
  --cluster genetic-explorer-cluster \
  --services genetic-explorer-service

# View logs
aws logs tail /ecs/genetic-explorer --follow
```

### GitHub Actions Deployment

1. Add repository secrets:
   - `AWS_ROLE_ARN`: IAM role for GitHub Actions
   - `SLACK_WEBHOOK_URL`: Slack notifications (optional)

2. Configure OIDC provider:
   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --thumbprint-list 6938fd4e98bab03faadb97b34396831e3780aea1 \
     --client-id-list sts.amazonaws.com
   ```

3. Push to `main` branch triggers deployment

### Blue/Green Deployment

For zero-downtime deployments:

```bash
# Update service with new task definition
aws ecs update-service \
  --cluster genetic-explorer-cluster \
  --service genetic-explorer-service \
  --task-definition genetic-explorer:NEW_REVISION \
  --deployment-configuration "minimumHealthyPercent=100,maximumPercent=200"
```

---

## Auto Scaling

### Configured Scaling Policies

The deployment includes three auto-scaling policies:

1. **CPU Utilization** (Target: 70%)
2. **Memory Utilization** (Target: 75%)
3. **ALB Request Count** (Target: 1000 requests/target)

### Manual Scaling

```bash
# Scale to 5 tasks
aws ecs update-service \
  --cluster genetic-explorer-cluster \
  --service genetic-explorer-service \
  --desired-count 5

# Scale back to 2
aws ecs update-service \
  --cluster genetic-explorer-cluster \
  --service genetic-explorer-service \
  --desired-count 2
```

### Scheduled Scaling

```bash
# Scale up during business hours
aws application-autoscaling put-scheduled-action \
  --service-namespace ecs \
  --resource-id service/genetic-explorer-cluster/genetic-explorer-service \
  --scalable-dimension ecs:service:DesiredCount \
  --scheduled-action-name BusinessHoursScaleUp \
  --schedule "cron(0 9 * * 1-5)" \
  --scalable-target-action MinCapacity=4,MaxCapacity=10
```

---

## Monitoring & Logging

### CloudWatch Logs

Logs are automatically sent to CloudWatch:

```bash
# View recent logs
aws logs tail /ecs/genetic-explorer --since 1h

# View specific container
aws logs get-log-events \
  --log-group-name /ecs/genetic-explorer \
  --log-stream-name ecs/genetic-explorer/CONTAINER_ID

# Search logs
aws logs filter-log-events \
  --log-group-name /ecs/genetic-explorer \
  --filter-pattern "ERROR"
```

### CloudWatch Metrics

Key metrics available:

| Metric | Description |
|--------|-------------|
| `CPUUtilization` | ECS task CPU usage |
| `MemoryUtilization` | ECS task memory usage |
| `RunningTaskCount` | Number of running tasks |
| `ALBRequestCount` | Requests per target |
| `ALBTargetResponseTime` | Response latency |
| `ALBHTTPCode_Target_5XX_Count` | 5xx errors |

### CloudWatch Alarms

Pre-configured alarms:

```bash
# View alarms
aws cloudwatch describe-alarms \
  --alarm-name-prefix genetic-explorer

# High CPU alarm triggers when CPU > 80% for 3 minutes
```

### Container Insights

Enable for detailed metrics:

```bash
aws ecs put-account-setting \
  --name containerInsights \
  --value enabled
```

---

## Security

### Network Security

- **Security Groups**:
  - ALB: Ports 80, 443 open to internet
  - ECS: Port 3000 open only from ALB
  - EFS: Port 2049 open only from ECS

- **Private Subnets**: ECS tasks run in private subnets with no direct internet access

### Data Encryption

- **At Rest**:
  - EFS: Encrypted with KMS
  - ECR: Image encryption
  - Secrets Manager: Secret encryption
  - SQLite: Application-level encryption

- **In Transit**:
  - HTTPS/TLS 1.2+ via ALB
  - EFS: TLS encryption
  - Service-to-service: AWS VPC

### IAM Roles

- **Task Execution Role**: Pulls images, writes logs, reads secrets
- **Task Role**: Access to KMS, EFS, and other AWS services

### Secrets Management

```bash
# Rotate encryption key
aws secretsmanager put-secret-value \
  --secret-id genetic-explorer/encryption-master-key \
  --secret-string "new-key"

# Restart ECS tasks to pick up new secret
aws ecs update-service \
  --cluster genetic-explorer-cluster \
  --service genetic-explorer-service \
  --force-new-deployment
```

---

## Troubleshooting

### Task Won't Start

Check task status:

```bash
aws ecs describe-tasks \
  --cluster genetic-explorer-cluster \
  --tasks $(aws ecs list-tasks \
    --cluster genetic-explorer-cluster \
    --query 'taskArns[0]' --output text) \
  --query 'tasks[0].{Status:lastStatus,Reason:stoppedReason,ExitCode:containers[0].exitCode}'
```

Common issues:

1. **CannotPullContainerError**: Check ECR permissions
2. **ResourceInitializationError**: Check EFS mount permissions
3. **OutOfMemoryError**: Increase task memory or optimize application

### Health Check Failing

```bash
# Check container logs
aws logs tail /ecs/genetic-explorer --follow

# SSH into container (requires ECS Exec)
aws ecs execute-command \
  --cluster genetic-explorer-cluster \
  --task <task-id> \
  --container genetic-explorer \
  --interactive \
  --command "/bin/sh"

# Inside container
curl http://localhost:3000/api/health
```

### High Latency

1. Check ALB metrics:
   ```bash
   aws cloudwatch get-metric-statistics \
     --namespace AWS/ApplicationELB \
     --metric-name TargetResponseTime \
     --dimensions Name=LoadBalancer,Value=<alb-name> \
     --start-time 2024-01-01T00:00:00Z \
     --end-time 2024-01-02T00:00:00Z \
     --period 3600 \
     --statistics Average
   ```

2. Scale horizontally:
   ```bash
   aws ecs update-service \
     --cluster genetic-explorer-cluster \
     --service genetic-explorer-service \
     --desired-count 4
   ```

### Database Lock Issues

If you see SQLite database lock errors:

1. **Reduce instances**: Scale down to 2 tasks
   ```bash
   aws ecs update-service \
     --cluster genetic-explorer-cluster \
     --service genetic-explorer-service \
     --desired-count 2
   ```

2. **Enable WAL mode**: Already enabled by default

3. **Consider RDS**: For high-write workloads, migrate to Amazon RDS PostgreSQL

### Costs Too High

Optimize costs:

1. **Use Fargate Spot**: Update capacity provider strategy
2. **Right-size**: Monitor CPU/memory and adjust task size
3. **Auto-scale down**: Set scheduled scaling for off-hours
4. **EFS Lifecycle**: Move old uploads to IA storage class

```bash
# Update to use Fargate Spot
aws ecs put-cluster-capacity-providers \
  --cluster genetic-explorer-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1,base=1 \
    capacityProvider=FARGATE_SPOT,weight=3
```

---

## Cost Estimation

Monthly costs (us-east-1, 2 tasks running 24/7):

| Service | Cost |
|---------|------|
| ECS Fargate (1 vCPU, 2 GB) | ~$75/month |
| ALB | ~$20/month + LCU charges |
| EFS (10 GB) | ~$3/month |
| Data Transfer | Variable |
| CloudWatch Logs | ~$5/month |
| Secrets Manager | ~$0.40/month |
| KMS | ~$1/month |
| **Total** | **~$105-150/month** |

---

## Cleanup

To delete all resources:

```bash
# Delete ECS service
aws ecs update-service \
  --cluster genetic-explorer-cluster \
  --service genetic-explorer-service \
  --desired-count 0

aws ecs delete-service \
  --cluster genetic-explorer-cluster \
  --service genetic-explorer-service \
  --force

# Delete CloudFormation stack
aws cloudformation delete-stack \
  --stack-name genetic-explorer-production

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name genetic-explorer-production

# Delete ECR images
aws ecr batch-delete-image \
  --repository-name genetic-explorer \
  --image-ids imageTag=latest

# Delete EFS (must delete access points first)
aws efs delete-access-point --access-point-id fsap-xxx
aws efs delete-file-system --file-system-id fs-xxx
```

---

## Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS Fargate Documentation](https://docs.aws.amazon.com/fargate/)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/)
- [EFS Performance](https://docs.aws.amazon.com/efs/latest/ug/performance.html)
