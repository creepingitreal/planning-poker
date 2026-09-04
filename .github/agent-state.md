# Agent State

## Goal

Deploy Planning Poker to AWS (backend + frontend), initially by hand via
AWS CLI/Console, with Terraform as a later stretch goal once manual
deployment is understood.

## Current Phase

ECS Express Mode Deployment (App Runner abandoned — see below)

## Current Topic

Deploying the corrected frontend image and completing the cross-service CORS
configuration.

## Progress

- AWS Basics ✅
- IAM ✅ (SSO login, profile `aws-sandbox`, account `492052863778`, region `eu-west-2`)
- ECR ✅ (`planning-poker-backend` and `planning-poker-frontend` repos)
- App Runner ❌ — abandoned: AWS announced App Runner stopped accepting new
  customers from 2026-04-30; migrated to ECS Express Mode instead.
- ECS Express Mode backend ✅ — service `planning-poker-backend-7932` in
  cluster `default` is RUNNING and healthy. Fixed two real production bugs
  along the way:
  1. `exec format error` — image built ARM64 on Apple Silicon Mac, ECS
     Fargate runtime needs linux/amd64. Fixed via
     `docker buildx build --platform linux/amd64`.
  2. ELB health check to `/` failing (`ENOENT .../client/dist/index.html`)
     — backend's SPA catch-all route tried serving a nonexistent frontend
     build. Fixed by adding explicit `/` and `/health` routes in
     `server/server.js` that return 200 before the static/catch-all routes.
  Deployed image tags: `session2` (broken, ARM64), `session3` (AMD64 fix),
  `session4` (AMD64 + health-check fix, currently live).
- ECS Express Mode frontend ⏳ IN PROGRESS — plan is to build via AWS
  CodeBuild (not local Docker CLI) so builds run linux/amd64 in AWS.
  - Confirmed the intended AWS target is account `492052863778` in
    `eu-west-2`, and the intended source is
    `https://procode.ghe.com/alex-demetriades/PlanningPoker.git` on `AWS-OKR`.
  - Code changes pushed to `AWS-OKR`: `client/Dockerfile` now
    accepts `VITE_SERVER_URL` as a build ARG/ENV (Vite bakes this in at
    build time, read via `import.meta.env` in `client/socket.js`); added
    `buildspec.frontend.yml` at repo root for CodeBuild.
  - Created ECR repo `planning-poker-frontend`.
  - CodeBuild project `planning-poker-frontend-build` created (Default
    project, GitHub Enterprise source, branch `AWS-OKR`, standard Linux
    image, privileged mode enabled, buildspec = `buildspec.frontend.yml`).
  - GitHub Enterprise source credentials are configured.
  - Service role `codebuild-planning-poker-frontend-service-role` has
    `AmazonEC2ContainerRegistryPowerUser`; build variables are configured.
  - CodeBuild successfully pushed `planning-poker-frontend:session1`.
  - Frontend ECS Express service created with public access and container
    port `80`. Its `session1` public URL returned a 404.
  - Cause: `client/Dockerfile` copied output to a relative path. The absolute
    Nginx path `/usr/share/nginx/html` is now fixed and committed as
    `8f10bd7`; rebuilding as `session2`.

## Constraints

- 1-2 hours per week
- Busy with sprint work
- Prefer AWS Console walkthroughs over CLI when asked; CLI is fine as a
  fallback or for verification commands.

## Next Recommended Action

1. Deploy frontend `session2` and verify its public URL serves the UI.
2. Update and redeploy backend with the frontend URL in
   `CORS_ORIGIN`/`PUBLIC_BASE_URL`.
3. End-to-end test in browser (create a room, confirm Socket.IO connects).
4. Only after full deployment works, revisit Terraform as a stretch goal.

## Last Updated

2026-09-04
