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
- Frontend deployment in progress, blocked on AWS CodeBuild GitHub
  Enterprise source authorization

---

## Phase 4

CloudWatch

Status: Not Started

---

## Phase 5

CI/CD (AWS CodeBuild)

Status: In Progress ⏳ — building frontend image via CodeBuild instead of
local Docker CLI, to avoid Mac ARM64 vs ECS AMD64 mismatches and move
toward a repeatable, production-like build process.

---

## Phase 6

Terraform (Infrastructure as Code)

Status: Stretch Goal — not started; current deployment is done manually via
AWS CLI/Console to build fundamentals first.
