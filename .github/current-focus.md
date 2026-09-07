# Current Phase

Phase 3/5 complete - Container Deployment (ECS Express Mode) + CI/CD (CodeBuild)

## Current Topic

Deployment complete. Consolidating what was built, then choosing between
CloudWatch observability and Terraform as the next phase.

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
- Confirmed the intended deployment target:
  - AWS account `492052863778`, region `eu-west-2`
  - GitHub Enterprise repository
    `https://procode.ghe.com/alex-demetriades/PlanningPoker.git`, branch `AWS-OKR`
- Configured CodeBuild GitHub Enterprise source credentials.
- Configured the CodeBuild service role with ECR push access.
- Configured CodeBuild environment variables for the account, ECR repository,
  image tag, and build-time backend URL.
- Successfully built and pushed frontend image `session1` with CodeBuild.
- Created the public ECS Express frontend service using container port `80`.
- Diagnosed the frontend 404 and corrected the Nginx web-root destination in
  `client/Dockerfile`; `session2` fixed it and is the deployed frontend.
- Removed the backend's static-file and SPA catch-all routes, which were
  logging `ENOENT` for a `client/dist` directory the backend image never
  contained.
- Switched `server/Dockerfile` from `npm run dev` (nodemon) to `npm start`.
- Added `buildspec.backend.yml` and a `planning-poker-backend-build`
  CodeBuild project so both services build the same way in AWS.
- Set the backend's `CORS_ORIGIN` and `PUBLIC_BASE_URL` to the frontend URL
  and confirmed the app works end to end in the browser. ✅

## Learning Next

- CloudWatch: metrics, alarms, and structured log queries
- Terraform: codifying the manually built infrastructure
- IAM policy resource scoping versus AWS managed policies

## Current Blocker

- None for the deployment itself. The backend CodeBuild project still fails
  with `ACCESS_DENIED` on `logs:CreateLogStream`, because the reused service
  role's auto-generated base policy is scoped to the frontend log group only.
  This is not urgent — the live backend runs the locally built `session4` —
  but it must be fixed before the hardened `session5` image can be deployed.

## Next Practical Task

1. Add the `/aws/codebuild/planning-poker-backend-build` ARNs to
   `CodeBuildBasePolicy-planning-poker-frontend-eu-west-2`.
2. Build backend `session5` and deploy it, so the trailing-slash
   normalisation in `server/server.js` is live.
3. Update `.env.prod`, which still points at the old Render URLs.
4. Decide the next phase: CloudWatch observability or Terraform.
