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

### Practical Work

- Confirmed AWS account `492052863778`, London region, and the GitHub
  Enterprise repository `alex-demetriades/PlanningPoker`.
- Configured a CodeBuild project with privileged Docker builds, GitHub
  Enterprise source credentials, ECR permissions, and environment variables.
- Built and pushed frontend image `planning-poker-frontend:session1`.
- Created the frontend ECS Express service on port `80`.
- Diagnosed and corrected the Nginx asset-path 404; replacement `session2`
  image is the next deployment step.

### Next Learning Step

Deploy frontend `session2`, then configure backend CORS for the frontend's
public URL and test a Socket.IO room end to end.
