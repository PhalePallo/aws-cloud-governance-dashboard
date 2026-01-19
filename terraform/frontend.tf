# S3 bucket for frontend
resource "aws_s3_bucket" "frontend" {
  bucket        = "aws-cloud-governance-frontend-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
}

# Block public access (CloudFront will handle access)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Upload frontend files
resource "aws_s3_object" "frontend_files" {
  for_each = {
    "index.html" = "${path.module}/../frontend/public/index.html"
    "app.js"     = "${path.module}/../frontend/src/app.js"
    "api.js"     = "${path.module}/../frontend/src/api.js"
    "style.css"  = "${path.module}/../frontend/src/style.css"
  }

  bucket = aws_s3_bucket.frontend.id
  key    = each.key
  source = each.value
  content_type = lookup({
    "index.html" = "text/html"
    "app.js"     = "application/javascript"
    "api.js"     = "application/javascript"
    "style.css"  = "text/css"
  }, each.key)
}
