variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource names"
  type        = string
  default     = "chatur"
}

variable "github_repository" {
  description = "GitHub repository in owner/repository format"
  type        = string
}

variable "github_branch" {
  description = "Branch permitted to deploy"
  type        = string
  default     = "main"
}







variable "deploy_services" {
  description = "Whether to create and run the ECS services"
  type        = bool
  default     = false
}

variable "frontend_image_tag" {
  description = "Existing ECR image tag for the frontend"
  type        = string
  default     = "initial"
}

variable "backend_image_tag" {
  description = "Existing ECR image tag for the backend"
  type        = string
  default     = "initial"
}