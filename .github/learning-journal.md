# Learning Journal

## 2026-07-29

### Topic

IAM

### What I Learned

- Roles vs Users
- Service Principals

### Practical Work

Created IAM Role.

### Questions

- Cross-account roles?

### AI Support

Explained trust relationships.
Reviewed understanding.
Generated quiz.

---

## 2026-09-04

### Topic

ECS Express Mode frontend deployment and AWS CodeBuild.

### What I Learned

- CodeBuild needs its own GitHub Enterprise source credential; local Git
  credentials and AWS SSO do not grant it repository access.
- AWS service roles need explicit permissions for their own actions. CodeBuild
  required ECR push permissions to authenticate Docker and push the image.
- Vite `VITE_*` values are embedded during the frontend build, so the backend
  URL must be supplied as a Docker build argument.
- Nginx serves static frontend files from `/usr/share/nginx/html`; a relative
  Docker `COPY` destination can produce a deployment that runs but returns 404.
- GPU-enabled CodeBuild compute is not needed for a standard Docker frontend
  build; use regular Linux compute to avoid unnecessary cost.
- A filesystem `ENOENT` is not a CORS error. When splitting a monolith into
  separate services, remove code paths that assumed the old single-container
  layout.
- IAM policies are scoped to resources, not just actions. AWS managed policies
  such as `AmazonEC2ContainerRegistryPowerUser` are broad, but auto-generated
  service-role policies are hard-coded to the resource that created them.
- Build-time versus runtime configuration: the frontend needs its backend URL
  baked in as a Docker build argument, whereas the backend reads `CORS_ORIGIN`
  from ECS environment variables at runtime.
- A CodeBuild variable only reaches the image if the buildspec explicitly
  passes it in with `--build-arg`. Runtime settings belong on the ECS service,
  not the build project.
- An origin is scheme + host + port only. A trailing slash on `CORS_ORIGIN`
  makes the browser's exact-match comparison fail, producing a CORS error that
  looks like a policy problem but is really a string problem.
- ECS rolling deployments run old and new tasks side by side. Until the new
  deployment becomes `PRIMARY`, old tasks keep serving requests — so a config
  change can appear to have "not worked" when it simply has not taken over.

### Practical Work

- Confirmed AWS account `492052863778`, London region, and the GitHub
  Enterprise repository `alex-demetriades/PlanningPoker`.
- Configured a CodeBuild project with privileged Docker builds, GitHub
  Enterprise source credentials, ECR permissions, and environment variables.
- Built and pushed frontend images `session1` and `session2`.
- Created the frontend ECS Express service on port `80`.
- Diagnosed and corrected the Nginx asset-path 404.
- Removed the backend's frontend-serving routes and switched its Dockerfile to
  `npm start`.
- Added `buildspec.backend.yml` and the `planning-poker-backend-build`
  CodeBuild project, then hit an IAM log-group scoping denial.
- Added trailing-slash normalisation to `server/server.js` so the CORS
  configuration cannot break the same way again.
- Set the backend's `CORS_ORIGIN` and `PUBLIC_BASE_URL` to the frontend URL
  and got the full application working on AWS end to end.

### Outcome

Planning Poker now runs on AWS as two separate public ECS Express services:

- Frontend: `https://pl-865b11cfa69f4fc4b551b8967bf219e6.ecs.eu-west-2.on.aws`
- Backend: `https://pl-8543c815d9e04e9389f336c0e4747118.ecs.eu-west-2.on.aws`

### Next Learning Step

Clear the CodeBuild log-group permission and deploy backend `session5`, then
move on to CloudWatch observability or Terraform.
