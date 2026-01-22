# -----------------------------
# Lambda Function
# -----------------------------
resource "aws_lambda_function" "audit_api" {
  filename         = "../lambda.zip"
  function_name    = "${var.project_name}-audit-api"
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  role             = aws_iam_role.lambda_role.arn
  memory_size      = 128
  timeout          = 10
  source_code_hash = filebase64sha256("../lambda.zip")

  environment {
    variables = {
      AUDIT_TABLE_NAME = aws_dynamodb_table.audit_logs.name
    }
  }
}

# -----------------------------
# API Gateway (REST API)
# -----------------------------
resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.project_name}-api"
  description = "API for Lambda audit function"
}

# IMPORTANT: keep the name "root" to avoid Terraform cycles
resource "aws_api_gateway_resource" "root" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "audit"
}

resource "aws_api_gateway_method" "get_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.root.id
  http_method   = "GET"
  authorization = "NONE"
}

# -----------------------------
# API Gateway → Lambda Integration (REST proxy)
# -----------------------------
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.root.id
  http_method             = aws_api_gateway_method.get_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  uri = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${aws_lambda_function.audit_api.arn}/invocations"
}

# -----------------------------
# Lambda Permission for API Gateway
# -----------------------------
resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.audit_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.api.id}/*/*"
}

# -----------------------------
# API Gateway Deployment
# -----------------------------
resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode({
      resource_id = aws_api_gateway_resource.root.id
      method_id   = aws_api_gateway_method.get_method.id
      uri         = aws_api_gateway_integration.lambda_integration.uri
    }))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.lambda_integration
  ]
}

# -----------------------------
# API Gateway Stage
# -----------------------------
resource "aws_api_gateway_stage" "dev_stage" {
  stage_name    = "dev"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.deployment.id
}
