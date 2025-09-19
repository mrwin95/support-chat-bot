# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

# install aws-cdk
# npm install -g aws-cdk
# check cdk --version
# boot strap app: cdk init app --language typescript
# install core cdk and construct
npm install aws-cdk-lib constructs

install kubectl Layer

npm install @aws-cdk/lambda-layer-kubectl-v32

command to check arn role 

aws sts get-caller-identity --profile [profile name]

-- you need to update kubectl config to manage your kubelet

aws eks update-kubeconfig --name solid-eks --region ca-central-1 --profile dev-eks-admin

ALB

Hybrid Nginx Ingress behind ALB (AWS ALB)

	•	You keep NGINX for custom ingress logic (e.g., rewrite rules, complex routing).
	•	An ALB (via AWS Load Balancer Controller) fronts NGINX with an IngressClass alb.
	•	Requests → ALB → NGINX Service → Pods.
	•	ALB gives you HTTPS + DNS + scaling, while NGINX handles app-level ingress.
    