AWS

## Terms
### High Availability


### Fault Tolerant
Redirect users to another instance when an error occurs with a particular instance.

### On Premise

### Scalability

### Elasticity
Only using / paying for the extra servers when needed.

## *aaS:
### SaaS
Software as a service
### IaaS
Infrastructure as a service

### BaaS
Backend as a service
- Priced on storage
- Firebase/ AWS DynamoDB are a BaaS

### FaaS
Function as a service (Lambda)
- Great use for microservices
- priced on execution time and RAM.
- AWS Lambda

### PaaS
Platform as a service
- Heroku/Elastic Beanstalk/etc


## VPCs
`Virtual Private Cloud`

Secure container / network for your account. Put your own resources and access control.

### EC2
Virtual Machine / Instance
- CPU, RAM, OS, NIC, Firewall


### RDS
Database Service

### S3
Storage Service

### Regions

-Redundancy across Availability Zones

### Lambda


### Serverless Architecture
Build out a BaaS structure to:
- API Gateway
  - Routes to:
  - Lambda functions
    - Might access:
    - Database layer

### API Gateway
- Key Management ?
- Route Definition
- Request Throttling
- Basic Caching
