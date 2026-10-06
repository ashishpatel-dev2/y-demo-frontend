#!/usr/bin/env bash
# Usage: deploy-ec2.sh backend|frontend
# Runs /home/ubuntu/app/deploy.sh on the EC2 server through AWS SSM
# (no SSH needed) and waits for it, failing the job if the deploy fails.
# Needs AWS credentials and EC2_INSTANCE_ID in the environment.
set -euo pipefail
SERVICE=$1

CMD_ID=$(aws ssm send-command \
  --instance-ids "$EC2_INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --comment "deploy $SERVICE ${GITHUB_SHA:0:7}" \
  --parameters commands="sudo -iu ubuntu /home/ubuntu/app/deploy.sh $SERVICE" \
  --query Command.CommandId --output text)
echo "SSM command id: $CMD_ID"

STATUS=Pending
for _ in $(seq 1 120); do # wait up to 10 minutes
  sleep 5
  STATUS=$(aws ssm get-command-invocation --command-id "$CMD_ID" \
    --instance-id "$EC2_INSTANCE_ID" --query Status --output text 2>/dev/null || echo Pending)
  case "$STATUS" in
    Pending | InProgress | Delayed) continue ;;
    *) break ;;
  esac
done

aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$EC2_INSTANCE_ID" \
  --query '[StandardOutputContent, StandardErrorContent]' --output text
echo "Deploy status: $STATUS"
[ "$STATUS" = Success ]
