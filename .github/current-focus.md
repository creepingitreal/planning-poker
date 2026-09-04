# Current Phase

Phase 3/5 - Container Deployment (ECS Express Mode) + CI/CD (CodeBuild)

## Current Topic

Deploying frontend via AWS CodeBuild; resolving GitHub Enterprise source
authorization before continuing.

## Completed

- AWS Core Concepts (Regions, AZs, Services Overview)
- IAM (SSO login flow, roles, verifying identity via `aws sts get-caller-identity`)
- ECR (created `planning-poker-backend` and `planning-poker-frontend` repos,
  pushed and tagged images)
- App Runner investigated and abandoned (service no longer accepts new
  customers as of 2026-04-30) in favor of ECS Express Mode
- ECS Express Mode backend deployment — RUNNING and healthy, after fixing:
  - CPU architecture mismatch (ARM64 build vs AMD64 ECS runtime)
  - ELB health-check failure (added `/` and `/health` routes to backend)

## Learning Next

- AWS CodeBuild (build service, source credentials, buildspecs)
- Passing frontend build-time config (`VITE_SERVER_URL`) via Docker build args
- ECS Express Mode two-container split-service deployment end-to-end
- CORS configuration across separately deployed frontend/backend

## Blockers

- **Must verify before continuing:** confirm correct AWS account/project
  and correct GitHub org/repo (github.com vs company GitHub Enterprise) —
  user suspects recent CodeBuild/ECR-frontend work may have been done in
  the wrong place.
- CodeBuild GitHub Enterprise source authorization failing:
  `authorization failed for primary source and source version AWS-OKR`.
  Needs source credentials configured under CodeBuild → Settings →
  Source credentials → GitHub Enterprise Server.

## Next Practical Task

1. Re-verify AWS account/region and GitHub repo target.
2. Fix CodeBuild GitHub Enterprise source credentials.
3. Add CodeBuild project env vars (`AWS_ACCOUNT_ID`, `ECR_REPOSITORY`,
   `IMAGE_TAG`, `VITE_SERVER_URL`) and confirm its service role can push to ECR.
4. Run the frontend build, deploy it as an ECS Express service (port 80),
   then update backend CORS/PUBLIC_BASE_URL to the new frontend URL.
