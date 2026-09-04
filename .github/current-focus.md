# Current Phase

Phase 3/5 - Container Deployment (ECS Express Mode) + CI/CD (CodeBuild)

## Current Topic

Completing the frontend ECS deployment and connecting the two public
services with the correct CORS configuration.

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
  `client/Dockerfile`; the corrected image is being produced as `session2`.

## Learning Next

- AWS CodeBuild (build service, source credentials, buildspecs)
- Passing frontend build-time config (`VITE_SERVER_URL`) via Docker build args
- ECS Express Mode two-container split-service deployment end-to-end
- CORS configuration across separately deployed frontend/backend

## Current Blocker

- The first frontend image returned a 404 because the Dockerfile copied Vite
  files to `usr/share/nginx/html` rather than `/usr/share/nginx/html`.
  The correction is committed; wait for the `session2` build, then update the
  frontend ECS service to that image.

## Next Practical Task

1. Confirm ECR contains `planning-poker-frontend:session2`.
2. Update the frontend ECS Express service to the `session2` image and verify
   that its public URL loads the Vue application.
3. Set the backend `CORS_ORIGIN` (and `PUBLIC_BASE_URL` if used) to the
   frontend public URL, then redeploy the backend.
4. Test room creation and Socket.IO connectivity in the browser.
