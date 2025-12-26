# Coffee Date Chronicles Infrastructure

This directory contains the AWS CloudFormation template for deploying the Coffee Date Chronicles application infrastructure.

## Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   # Install AWS CLI (if not already installed)
   # macOS
   brew install awscli
   
   # Configure AWS credentials
   aws configure
   ```

2. **AWS Account with appropriate permissions**
   - DynamoDB table creation
   - S3 bucket creation and management
   - IAM user and role creation
   - CloudFormation stack management

## Infrastructure Components

The CloudFormation template (`coffee-date-chronicles.yaml`) creates:

- **DynamoDB Tables**:
  - `coffee-date-chronicles-coffee-dates` - Stores coffee date records
  - `coffee-date-chronicles-photos` - Stores photo metadata

- **S3 Bucket**:
  - `coffee-date-chronicles-photos-{AccountId}` - Stores photo files with public read access

- **IAM Resources**:
  - Application role for future Lambda/EC2 usage
  - Application user with programmatic access
  - Access keys for the application

## Deployment

### 1. Deploy the CloudFormation Stack

```bash
# Navigate to the infra directory
cd infra

# Deploy the stack
aws cloudformation deploy \
  --template-file coffee-date-chronicles.yaml \
  --stack-name coffee-date-chronicles \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

### 2. Get Stack Outputs

After deployment, retrieve the configuration values:

```bash
# Get all stack outputs
aws cloudformation describe-stacks \
  --stack-name coffee-date-chronicles \
  --region us-east-1 \
  --query 'Stacks[0].Outputs'

# Get environment configuration specifically
aws cloudformation describe-stacks \
  --stack-name coffee-date-chronicles \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`EnvironmentConfig`].OutputValue' \
  --output text
```

### 3. Configure Application Environment

Copy the output from the `EnvironmentConfig` and add it to your `web-app/.env.local` file:

```bash
# Example output to add to .env.local
AWS_REGION=us-east-1
S3_BUCKET_NAME=coffee-date-chronicles-photos-123456789012
DYNAMODB_TABLE_PREFIX=coffee-date-chronicles
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

## Stack Management

### Update Stack
```bash
aws cloudformation deploy \
  --template-file coffee-date-chronicles.yaml \
  --stack-name coffee-date-chronicles \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

### Delete Stack
```bash
# Warning: This will delete all data!
aws cloudformation delete-stack \
  --stack-name coffee-date-chronicles \
  --region us-east-1
```

### Monitor Stack Events
```bash
aws cloudformation describe-stack-events \
  --stack-name coffee-date-chronicles \
  --region us-east-1
```

## Security Notes

- The S3 bucket allows public read access to photos (required for the application)
- IAM user credentials are output in CloudFormation - store them securely
- Consider rotating access keys periodically
- The stack creates resources that may incur AWS charges

## Troubleshooting

### Common Issues

1. **Stack creation fails due to bucket name conflict**
   - S3 bucket names must be globally unique
   - The template uses your AWS Account ID to ensure uniqueness

2. **Permission denied errors**
   - Ensure your AWS user has the necessary permissions
   - Check that `CAPABILITY_NAMED_IAM` is included in the deploy command

3. **Region-specific issues**
   - Ensure you're deploying to the same region specified in your application configuration
   - Some AWS services have region-specific limitations

### Getting Help

Check CloudFormation events for detailed error messages:
```bash
aws cloudformation describe-stack-events \
  --stack-name coffee-date-chronicles \
  --region us-east-1 \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
```

## Cost Considerations

This infrastructure uses:
- DynamoDB with on-demand billing
- S3 with standard storage (lifecycle rules transition to cheaper storage after 30/90 days)
- No ongoing compute costs (unless you add Lambda functions later)

Estimated monthly cost for low usage: $1-5 USD