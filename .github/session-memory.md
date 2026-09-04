# Session Memory

## Current Goal

Deploy Planning Poker to AWS (backend + frontend) using ECS Express Mode,
building images with AWS CodeBuild rather than local Docker CLI.
Terraform is a stretch goal for later, once manual deployment is solid.

## Topics Completed

- AWS account, region, IAM, and AWS SSO CLI login (profile `aws-sandbox`,
  account `492052863778`, region `eu-west-2`)
- ECR: image repositories, tagging, pushing, digests versus tags
- App Runner investigated then abandoned (AWS stopped accepting new App
  Runner customers as of 2026-04-30); migrated to ECS Express Mode
- ECS Express Mode fundamentals: default VPC/subnet requirement, target
  groups, ELB health checks, service events, CloudWatch logs
- Real-world debugging: CPU architecture mismatch (Mac ARM64 image versus ECS
  AMD64 runtime) and an ELB health-check failure caused by the backend's SPA
  catch-all route
- AWS CodeBuild: GitHub Enterprise source credentials, privileged Docker
  builds, project environment variables, and IAM service-role permissions

## Current Understanding

Comfortable with: AWS CLI/SSO auth flow, ECR push/tag workflow, reading ECS
service events and CloudWatch logs, building images for the target CPU
architecture, and configuring CodeBuild to build and publish an image.

Still developing: the two-pass deployment process for connecting a
separately-deployed frontend and backend (build-time versus runtime
configuration, CORS).

## Practical Work Completed

- Verified AWS identity via `aws sts get-caller-identity --profile aws-sandbox`
- Located/used ECR repo `planning-poker-backend`; built and pushed
  `session2` (broken ARM64), `session3` (AMD64 fix), `session4` (AMD64 +
  health-check fix -- currently deployed and healthy)
- Diagnosed and fixed two real ECS deployment failures using CloudWatch logs
  as evidence before acting
- Added `/` and `/health` routes to `server/server.js` so ELB health checks
  succeed independent of frontend presence
- Created ECS Express service `planning-poker-backend-7932`; confirmed
  RUNNING and reachable via its public URL
- Confirmed the correct AWS account (`492052863778`), region (`eu-west-2`),
  and GitHub Enterprise repository
  (`alex-demetriades/PlanningPoker` on `procode.ghe.com`)
- Created ECR repo `planning-poker-frontend`
- Updated `client/Dockerfile` to accept `VITE_SERVER_URL` as a build argument
  (Vite bakes env vars in at build time)
- Added `buildspec.frontend.yml` for CodeBuild to build/push the frontend
  image with the correct build argument
- Configured CodeBuild project `planning-poker-frontend-build` with GitHub
  Enterprise source credentials, ECR push permissions, and build variables
- Successfully built and pushed frontend image
  `planning-poker-frontend:session1`
- Created the public frontend ECS Express service on port `80`
- Diagnosed its initial 404: `client/Dockerfile` copied Vite assets to a
  relative destination rather than `/usr/share/nginx/html`; the corrected
  `session2` image is being built for deployment

## Next Task

1. Confirm frontend `session2` is in ECR, deploy it, and verify the UI loads.
2. Update backend `CORS_ORIGIN`/`PUBLIC_BASE_URL` to the frontend's real URL
   and redeploy backend.
3. End-to-end browser test: create a room and confirm Socket.IO connects
   without CORS errors.

## Suggested Next Topic

Cross-origin browser security and deployment configuration (CORS and
build-time versus runtime frontend variables) -- then, once full deployment
works, Terraform as a stretch goal to codify what was done manually.
