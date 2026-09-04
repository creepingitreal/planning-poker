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

Status: In Progress ⏳

App Runner was abandoned after AWS announced it stopped accepting new
customers (2026-04-30). Migrated to ECS Express Mode.

- Backend deployed and healthy ✅ (fixed ARM64/AMD64 architecture mismatch
  and an ELB health-check bug in the process)
- Frontend ECS Express service created ✅
- Frontend `session1` image deployed but returned a 404 due to an Nginx
  Docker `COPY` destination error; corrected `session2` is being built and
  will need deploying

---

## Phase 4

CloudWatch

Status: Not Started

---

## Phase 5

CI/CD (AWS CodeBuild)

Status: In Progress ⏳ — GitHub Enterprise source credentials, build
environment variables, and ECR permissions are configured. CodeBuild
successfully built and pushed frontend image `session1`; a corrected
`session2` image is in progress.

---

## Phase 6

Terraform (Infrastructure as Code)

Status: Stretch Goal — not started; current deployment is done manually via
AWS CLI/Console to build fundamentals first.
