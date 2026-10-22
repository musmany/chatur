resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  comment         = "Chatur frontend and WebSocket distribution"
  price_class     = "PriceClass_100"
  is_ipv6_enabled = true

  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "${local.name}-alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Normal website requests go to the frontend through the ALB.
  default_cache_behavior {
    target_origin_id       = "${local.name}-alb"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"
    ]

    cached_methods = ["GET", "HEAD"]

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"

    compress = true
  }

  # WebSocket handshake and traffic go through the same ALB,
  # then the ALB routes /ws requests to the backend target group.
  ordered_cache_behavior {
    path_pattern           = "/ws*"
    target_origin_id       = "${local.name}-alb"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"
    ]

    cached_methods = ["GET", "HEAD"]

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"

    compress = false
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = local.common_tags
}