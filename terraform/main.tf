data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

locals {
  name = var.project_name

  common_tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}