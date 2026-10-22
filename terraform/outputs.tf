output "cloudfront_url" {
  description = "Public HTTPS URL for Chatur"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.main.domain_name
}

output "frontend_ecr_repository_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "backend_ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs.id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "frontend_target_group_arn" {
  value = aws_lb_target_group.frontend.arn
}

output "backend_target_group_arn" {
  value = aws_lb_target_group.backend.arn
}

output "ecs_cluster_name" {
  value = "${local.name}-cluster"
}









output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "frontend_log_group" {
  value = aws_cloudwatch_log_group.frontend.name
}

output "backend_log_group" {
  value = aws_cloudwatch_log_group.backend.name
}

output "ecs_execution_role_arn" {
  value = aws_iam_role.ecs_execution.arn
}

output "ecs_task_role_arn" {
  value = aws_iam_role.ecs_task.arn
}