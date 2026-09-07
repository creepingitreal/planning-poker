# Agent State

## Goal

Deploy Planning Poker to AWS (backend + frontend), initially by hand via
AWS CLI/Console, with Terraform as a later stretch goal once manual
deployment is understood.

## Current Phase

ECS Express Mode Deployment ✅ COMPLETE — choosing between CloudWatch and
Terraform for the next phase.

## Current Topic

Deployment complete. Choosing the next phase: CloudWatch observability or
Terraform.

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
- ECS Express Mode frontend ✅ — built via AWS CodeBuild (not local Docker
  CLI) so builds run linux/amd64 in AWS.
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
    `8f10bd7`; `session2` is the deployed frontend image.
- Backend split-service cleanup ✅
  - Removed `express.static` and the SPA catch-all from `server/server.js`.
    The backend image is built from `server/` only, so those routes logged
    `ENOENT ... /client/dist/index.html`. The backend now serves only
    Socket.IO, `/`, and `/health`.
  - Changed `server/Dockerfile` to `npm start` instead of `npm run dev`.
  - Added `buildspec.backend.yml` and CodeBuild project
    `planning-poker-backend-build`, reusing the frontend service role.
  - Blocked: the reused role's auto-generated base policy is scoped to the
    frontend log group, so the backend build fails with `ACCESS_DENIED` on
    `logs:CreateLogStream`. Add the
    `/aws/codebuild/planning-poker-backend-build` ARNs to that policy. Not
    urgent — the live backend is still the locally built `session4`.
  - Added trailing-slash normalisation to `server/server.js` so
    `CORS_ORIGIN`/`PUBLIC_BASE_URL` cannot break again. Committed but NOT yet
    deployed, since it needs the blocked `session5` build.
- END TO END WORKING ✅ — set `CORS_ORIGIN` and `PUBLIC_BASE_URL` on the
  backend ECS service to the frontend URL with no trailing slash. The final
  confusion was ECS running old and new tasks concurrently during the
  rolling deployment, so old tasks kept serving the stale header until the
  new deployment became `PRIMARY`.
  - Frontend: `https://pl-865b11cfa69f4fc4b551b8967bf219e6.ecs.eu-west-2.on.aws`
  - Backend: `https://pl-8543c815d9e04e9389f336c0e4747118.ecs.eu-west-2.on.aws`

## Constraints

- 1-2 hours per week
- Busy with sprint work
- Prefer AWS Console walkthroughs over CLI when asked; CLI is fine as a
  fallback or for verification commands.

## Next Recommended Action

1. Add the backend log group ARNs to the CodeBuild service role policy.
2. Build backend `session5` and deploy it, making the trailing-slash
   normalisation live.
3. Update `.env.prod`, which still references the old Render URLs.
4. Choose the next phase: CloudWatch (metrics, alarms, log queries) or
   Terraform (codifying what was built by hand).

## Last Updated

2026-09-04
