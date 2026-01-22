# S3 bucket for frontend (private; CloudFront will access via OAC + bucket policy)
resource "aws_s3_bucket" "frontend" {
  bucket        = "aws-cloud-governance-frontend-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
}

# Block public access (recommended when using CloudFront OAC)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

# Upload frontend files (match your index.html paths: /src/style.css and /src/app.js)
resource "aws_s3_object" "frontend_files" {
  for_each = {
    "index.html"    = "${path.module}/../frontend/public/index.html"
    "src/app.js"    = "${path.module}/../frontend/src/app.js"
    "src/api.js"    = "${path.module}/../frontend/src/api.js"
    "src/style.css" = "${path.module}/../frontend/src/style.css"
  }

  bucket = aws_s3_bucket.frontend.id
  key    = each.key
  source = each.value
  etag   = filemd5(each.value)

  content_type = lookup({
    "index.html"    = "text/html"
    "src/app.js"    = "application/javascript"
    "src/api.js"    = "application/javascript"
    "src/style.css" = "text/css"
  }, each.key)
}
