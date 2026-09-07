# Learning Roadmap

## Phase 1

AWS Fundamentals

Status: Complete ✅

---

## Phase 2

IAM + ECR

Status: Complete ✅ (AWS SSO CLI login, ECR repos for backend and frontend)

---

## Phase 3

Container Deployment (App Runner → ECS Express Mode)

Status: Complete ✅

App Runner was abandoned after AWS announced it stopped accepting new
customers (2026-04-30). Migrated to ECS Express Mode.

- Backend deployed and healthy ✅ (fixed ARM64/AMD64 architecture mismatch
  and an ELB health-check bug in the process)
- Backend cleaned up for split-service deployment ✅ — removed
  frontend-serving routes and switched to `npm start`
- Frontend ECS Express service created ✅
- Frontend `session1` returned a 404 due to an Nginx Docker `COPY`
  destination error; `session2` fixed it ✅
- Backend `CORS_ORIGIN`/`PUBLIC_BASE_URL` pointed at the frontend URL ✅
- End-to-end verified in the browser ✅ — the app runs on AWS with the
  frontend and backend as two separate public ECS services

---

## Phase 4

CloudWatch

Status: Not Started

---

## Phase 5

CI/CD (AWS CodeBuild)

Status: In Progress ⏳ — GitHub Enterprise source credentials, build
environment variables, and ECR permissions are configured. CodeBuild builds
and pushes the frontend image; the deployed frontend is `session2`. A second
project, `planning-poker-backend-build`, is set up to build the backend the
same way, but has not yet produced an image — it is still blocked on a
CloudWatch log-group permission on the shared service role. The live backend
is still the locally built `session4`.

---

## Phase 6

Terraform (Infrastructure as Code)

Status: Stretch Goal — not started; current deployment is done manually via
AWS CLI/Console to build fundamentals first.
