# AWS Cloud Governance Dashboard

A **read-only cloud governance and audit dashboard** built on AWS.  
The project demonstrates how to securely expose audit-style data from AWS services using a **serverless, Free Tier–friendly architecture**.

---

## 🚀 Live Demo

**Frontend (CloudFront):**  
https://daip0qdddfduy.cloudfront.net/

**Backend (API Gateway):**  
`GET /audit` (secured via API Gateway → Lambda integration)

---

## 🧩 Problem Statement

Cloud environments generate frequent infrastructure changes (Lambda updates, S3 bucket creation, DynamoDB table deletions, etc.).  
These events are often difficult to visualize quickly without logging into multiple AWS consoles.

This project solves that by:
- Providing a **single read-only dashboard**
- Displaying **audit-style events** in near real-time
- Using a **secure, serverless architecture**
- Remaining **cost-efficient and Free Tier–safe**

---

## 🏗️ Architecture Overview

Browser
↓
CloudFront (CDN)
↓
S3 (Private Bucket, OAC enabled)
↓
API Gateway (REST API)
↓
AWS Lambda (Node.js)
↓
DynamoDB (Audit Logs)


### Key Design Decisions
- **Static frontend** for performance and simplicity
- **Private S3 bucket** with CloudFront Origin Access Control (OAC)
- **Serverless backend** for automatic scaling
- **Infrastructure as Code (Terraform)** for reproducibility

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES Modules)
- Hosted on **Amazon S3 + CloudFront**

### Backend
- AWS Lambda (Node.js 20)
- Amazon API Gateway (REST API)
- Amazon DynamoDB

### Infrastructure
- Terraform
- AWS IAM
- CloudFront Origin Access Control (OAC)

---

## 🔐 Security Model

- S3 bucket is **fully private**
- CloudFront accesses S3 using **signed requests (OAC)**
- API Gateway invokes Lambda using **explicit IAM permissions**
- Lambda has **least-privilege IAM access** to DynamoDB
- Frontend is **read-only** (no write operations exposed)

---

## 💸 Cost & Free Tier Considerations

This project is designed to stay within AWS Free Tier limits:

- **Lambda:**  
  1M requests / month (Free Tier)
- **API Gateway (REST):**  
  1M requests / month (for new AWS accounts)
- **DynamoDB:**  
  On-demand, minimal storage and scans
- **CloudFront:**  
  Free tier bandwidth allowance
- **S3:**  
  Minimal storage and request usage

No paid features (caching, WAF, custom domains) are enabled.

---

## 📂 Project Structure

aws-cloud-governance-dashboard/
├── backend/
│ └── src/
│ ├── handlers/
│ │ └── getAuditLogs.ts
│ ├── services/
│ │ └── dynamodb.ts
│ └── scripts/
│ └── package-lambda.ps1
├── frontend/
│ ├── public/
│ │ └── index.html
│ └── src/
│ ├── app.js
│ ├── api.js
│ └── style.css
├── lambda-src/
│ └── index.js
├── terraform/
│ ├── cloudfront.tf
│ ├── frontend.tf
│ ├── lambda.tf
│ ├── dynamodb.tf
│ ├── iam.tf
│ ├── outputs.tf
│ └── variables.tf
└── README.md


---

## ⚙️ How It Works

1. User opens the CloudFront URL
2. Static frontend is served securely from S3
3. Clicking **“Load Audit Logs”** calls API Gateway
4. API Gateway invokes Lambda via AWS proxy integration
5. Lambda scans DynamoDB for audit records
6. Results are returned and rendered in the UI

---

## 🧪 Sample Audit Events

The dashboard displays events such as:

- `UPDATE` — Lambda Function
- `CREATE` — S3 Bucket
- `DELETE` — DynamoDB Table

Each event shows:
- Action type
- Resource name
- Event ID
- Timestamp

---

## 🧠 What This Project Demonstrates

- Secure CloudFront + S3 static hosting
- Correct REST API Gateway → Lambda proxy integration
- IAM least-privilege design
- Handling Terraform dependency cycles safely
- Debugging real-world AWS deployment issues
- Clean separation between frontend, backend, and infrastructure

---

## 🔮 Possible Improvements

- Pagination or filtering of audit logs
- Date range selection
- Authentication (Cognito) for protected access
- CloudTrail integration for real AWS events
- Metrics dashboard (CloudWatch)

---
## Setup Instructions (Local + AWS)
Prerequisites

- Install the following tools:

- Git

- Node.js 18+ (Node 20 recommended)

- Terraform 1.7+

- AWS CLI v2

- An AWS account (Free Tier friendly)

- Optional (recommended):

- PowerShell (Windows) for packaging scripts

- Repository Structure (High Level)

- frontend/ — Static UI (HTML/CSS/JS)

- backend/ — Backend source (handlers/services/scripts)

- lambda-src/ — Lambda entry + bundling source

- lambda-dist/ — Bundled Lambda output

- terraform/ — Infrastructure as Code (S3, CloudFront, API Gateway, Lambda, DynamoDB, IAM)
---

## 📌 Why This Project Matters

This project bridges the gap between:
- **Infrastructure knowledge** and **frontend visibility**
- **Cloud theory** and **real-world deployment**
- **Serverless design** and **practical governance use cases**

It is intentionally simple, secure, and extensible.

---

## 📄 License

This project is for learning and demonstration purposes.  
You are free to fork, modify, and extend it.

---

## ✍️ Author

Built by **Pallo Phale**  
Focused on cloud-native development, serverless architectures, and frontend/backend integration.

