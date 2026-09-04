# Agent State

## Goal

Deploy Planning Poker to AWS (backend + frontend), initially by hand via
AWS CLI/Console, with Terraform as a later stretch goal once manual
deployment is understood.

## Current Phase

ECS Express Mode Deployment (App Runner abandoned — see below)

## Current Topic

CI-based image builds (AWS CodeBuild) for the frontend, blocked on GitHub
Enterprise source authorization.

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
  - Code changes done & pushed to `AWS-OKR`: `client/Dockerfile` now
    accepts `VITE_SERVER_URL` as a build ARG/ENV (Vite bakes this in at
    build time, read via `import.meta.env` in `client/socket.js`); added
    `buildspec.frontend.yml` at repo root for CodeBuild.
  - Created ECR repo `planning-poker-frontend`.
  - **IMPORTANT UNRESOLVED ISSUE:** while setting up CodeBuild, user
    realized they may have been working in the wrong AWS account/project
    and/or wrong GitHub org. Must re-verify AWS account (`492052863778`,
    profile `aws-sandbox`, region `eu-west-2`) and the correct GitHub
    repo/org (github.com vs company GitHub Enterprise Server) before
    continuing, and check whether ECR repo / CodeBuild project / IAM role
    `planning-poker-frontend-codebuild-role` were created in the wrong
    place.
  - CodeBuild project `planning-poker-frontend-build` created (Default
    project, GitHub Enterprise source, branch `AWS-OKR`, Ubuntu/Standard
    image, Privileged mode enabled, buildspec = `buildspec.frontend.yml`).
  - Blocked: manual build failed at DOWNLOAD_SOURCE with
    `authorization failed for primary source and source version AWS-OKR`.
    Needs GitHub Enterprise source credentials configured under
    CodeBuild → Settings → Source credentials.
  - Not yet done: CodeBuild project env vars (`AWS_ACCOUNT_ID`,
    `ECR_REPOSITORY=planning-poker-frontend`, `IMAGE_TAG`,
    `VITE_SERVER_URL`) and ECR push permissions on the CodeBuild service
    role.

## Constraints

- 1-2 hours per week
- Busy with sprint work
- Prefer AWS Console walkthroughs over CLI when asked; CLI is fine as a
  fallback or for verification commands.

## Next Recommended Action

1. Confirm correct AWS account/project and GitHub org/repo before doing
   anything else.
2. Fix CodeBuild GitHub Enterprise source credentials (auth error).
3. Add CodeBuild project env vars + ECR push permissions on its service role.
4. Run the frontend build, push image to ECR, create its ECS Express
   service (container port 80, public access).
5. Update backend `CORS_ORIGIN`/`PUBLIC_BASE_URL` to the new frontend URL
   and redeploy backend.
6. End-to-end test in browser (create a room, confirm Socket.IO connects).
7. Only after full deployment works, revisit Terraform as a stretch goal.

## Last Updated

2026-09-04
