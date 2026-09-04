# Session Memory

## Current Goal

Deploy Planning Poker to AWS (backend + frontend) using ECS Express Mode,
building images with AWS CodeBuild rather than local Docker CLI.
Terraform is a stretch goal for later, once manual deployment is solid.

## Topics Completed

- AWS account, region, IAM, and AWS SSO CLI login (profile `aws-sandbox`,
  account `492052863778`, region `eu-west-2`)
- ECR: image repositories, tagging, pushing, digests vs tags
- App Runner investigated then abandoned (AWS stopped accepting new App
  Runner customers as of 2026-04-30); migrated to ECS Express Mode
- ECS Express Mode fundamentals: default VPC/subnet requirement, target
  groups, ELB health checks, service events, CloudWatch logs
- Real-world debugging: CPU architecture mismatch (Mac ARM64 image vs ECS
  AMD64 runtime) and an ELB health-check failure caused by the backend's
  SPA catch-all route

## Current Understanding

Comfortable with: AWS CLI/SSO auth flow, ECR push/tag workflow, reading
ECS service events and CloudWatch logs to diagnose failures, and the
concept of building images for the correct target CPU architecture.

Still developing: AWS CodeBuild setup (source credentials, buildspecs,
IAM roles for service permissions), and the two-pass deployment process
for connecting a separately-deployed frontend and backend (build-time vs
runtime configuration, CORS).

## Practical Work Completed

- Verified AWS identity via `aws sts get-caller-identity --profile aws-sandbox`
- Located/used ECR repo `planning-poker-backend`; built and pushed
  `session2` (broken ARM64), `session3` (AMD64 fix), `session4` (AMD64 +
  health-check fix — currently deployed and healthy)
- Diagnosed and fixed two real ECS deployment failures using CloudWatch
  logs as evidence before acting
- Added `/` and `/health` routes to `server/server.js` so ELB health
  checks succeed independent of frontend presence
- Created ECS Express service `planning-poker-backend-7932`; confirmed
  RUNNING and reachable via its public URL
- Created ECR repo `planning-poker-frontend`
- Updated `client/Dockerfile` to accept `VITE_SERVER_URL` as a build arg
  (Vite bakes env vars in at build time)
- Added `buildspec.frontend.yml` for CodeBuild to build/push the frontend
  image with the correct build arg
- Started creating CodeBuild project `planning-poker-frontend-build`
  (GitHub Enterprise source, branch `AWS-OKR`) — currently blocked on
  source authorization; also flagged a possible wrong-AWS-project/wrong-repo
  mix-up that needs verifying before continuing

## Next Task

1. Confirm correct AWS account/project and GitHub org/repo before resuming.
2. Fix CodeBuild GitHub Enterprise source credentials (auth error blocking
   builds).
3. Add CodeBuild project env vars and confirm ECR push permissions on its
   service role.
4. Build and deploy the frontend as an ECS Express service (port 80).
5. Update backend CORS_ORIGIN/PUBLIC_BASE_URL to the frontend's real URL
   and redeploy backend.
6. End-to-end browser test (create a room, confirm Socket.IO connects
   without CORS errors).

## Suggested Next Topic

AWS CodeBuild (source credentials, buildspecs, IAM service roles) — then,
once full deployment works, Terraform as a stretch goal to codify what was
done manually.
