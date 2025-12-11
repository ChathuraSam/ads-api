# Ads API – AWS Serverless (Node.js + TypeScript)

## Overview

This project implements a fully serverless **Ads API** using **AWS Lambda**, **API Gateway**, **DynamoDB**, **S3**, **SNS**, **Cognito (mocked locally)**, **TypeScript**, and **AWS SAM**.

Authenticated users can create ad records. Each ad is stored in DynamoDB, optionally uploads an image to S3, and publishes a notification to SNS.

This repository includes:

* Lambda source code (Node.js + TypeScript)
* AWS SAM template (`template.yaml`)
* Jest unit tests
* GitHub Actions CI workflow
* Local development support via SAM

---

## Technologies Used

* **AWS Lambda** – Compute
* **API Gateway** – REST API exposure
* **DynamoDB** – Ad storage
* **S3** – Optional image upload
* **SNS** – Notification publishing
* **Cognito** – Auth (Mocked locally)
* **TypeScript** – Strong typing
* **Jest** – Unit testing
* **AWS SAM** – IaC + local development

---

## Project Structure

```
ads-api/
 ├── src/
 │    ├── functions/
 │    │     ├── ads/
 │    │     │     └── handler.ts
 │    │     └── hello-world/
 │    │           └── handler.ts
 │    ├── libs/
 │    │     ├── constants.ts
 │    │     └── logger.ts
 │    └── services/
 │          ├── dynamodb-service.ts
 │          ├── s3-service.ts
 │          └── sns-service.ts
 ├── tests/
 │    ├── unit/
 │    │     ├── ads-handler.test.ts
 │    │     └── test-handler.test.ts
 ├── events/
 │    └── event.json
 ├── coverage/
 ├── template.yaml
 ├── jest.config.ts
 ├── tsconfig.json
 ├── package.json
 ├── samconfig.yaml
 ├── env.vars-local.json
 ├── instructions.md
 └── README.md
```

---

## Features

### Create an Ad

`POST /ads` allows creating:

* **title** (string)
* **price** (number)
* **imageBase64** (optional base64 image)

### Optional Image Upload to S3

If `imageBase64` is provided:

1. Converted to binary buffer
2. Uploaded to S3 bucket under `ads/{id}.jpg`
3. Public S3 URL returned in response

### SNS Notification on Ad Creation

Each successful ad creation publishes an event to SNS containing:

* Ad ID
* User ID
* Title & price
* Image URL
* Timestamp

### DynamoDB Storage

Ads are stored in a table with structure:

```
Partition Key: id (string)
```

Additional data includes:

* userId
* createdAt
* imageUrl

### Structured Logging

Every request includes structured logs with:

* requestId
* userId
* ad payload

---

## Authentication

### Production – Cognito User Pool

If deployed, API Gateway validates JWT tokens from Cognito.
User identity available as:

```
event.requestContext.authorizer.claims.sub
```

---

### Local Development – Cognito Mock (Allowed)

The assignment explicitly permits mocking Cognito locally.

Send the header:

```
x-user-id: test-user
```

This simulates an authenticated user.

Lambda resolves:

```ts
const userId =
  event.requestContext.authorizer?.claims?.sub ||
  event.headers["x-user-id"] ||
  "anonymous";
```

---

## Running Locally with SAM

### 1. Install dependencies

```
npm install
```

### 2. Build the project

```
npm run build
```

### 3. Start API locally

```
npm run local-start
```

### 4. Test using Postman or curl

**POST** `http://127.0.0.1:3000/ads`

Headers:

```
Content-Type: application/json
x-user-id: test-user
```

Body example:

```json
{
  "title": "Laptop",
  "price": 150000,
  "imageBase64": "<base64-string>"
}
```

---

## Unit Testing

Run tests:

```
npm test
```

Tests include:

* Input validation
* Successful ad creation
* SNS + Dynamo integrations (mocked)

---

## CI/CD – GitHub Actions

Workflow includes:

* Node setup
* Dependency install
* Running tests
* Failing on errors

Located in:

```
.github/workflows/deploy.yml
```

---

## Deployment

```
npm run deploy-dev
```

SAM will create:

* Lambda
* DynamoDB table
* S3 bucket
* SNS Topic
* API Gateway
* IAM roles

---

## Verifying SNS Messages

You can confirm SNS works by **subscribing your email**:

1. SNS → Topics → AdsCreatedTopic
2. Create Subscription → Email
3. Check your inbox
4. Trigger an ad creation

You will receive the message JSON.

---

## POSTMAN setup and run the APIs
I have deploy the SAM stack to my personal AWS account.

base URL: https://ahypjsl53j.execute-api.us-east-1.amazonaws.com/Prod

Go to Postman and import the file in this repository
```
api.postman_collection.json
```

add the base URL to environment and invoke the API


Let's get the Bearer Token first,

I have created a test user
Run the Authenticate API to get the IdToken

```
Authenticate(POST): https://cognito-idp.us-east-1.amazonaws.com/

{
    "AuthFlow": "USER_PASSWORD_AUTH",
    "ClientId": "7ekff3d2508hkva3cfcf22juf5",
    "AuthParameters": {
        "USERNAME": "testuser2@test.com",
        "PASSWORD": "TestUser1"
    }
}
```

copy the IdToken(valid for 1 hour)

/ads API needs to add a Authorization(Bearer token)
paste the IdToken in to there and execute the API.



## Notes

This project implements all the required functionality and follows best practices in:

* TypeScript
* AWS Serverless
* IaC with SAM
* Logging
* Testing
* API design

---

## Author

Developed by Chathura as part of an AWS Serverless coding assessment.

---

## License

MIT License
