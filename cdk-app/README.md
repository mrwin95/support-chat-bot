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
    

check subnet

aws ec2 describe-subnets --region ca-central-1 --profile ausan \
  --filters "Name=vpc-id,Values=vpc-0ab05a48154ce72cb" \
  --query "Subnets[*].{ID:SubnetId,AZ:AvailabilityZone,Public:MapPublicIpOnLaunch}" \
  --output table


  create tags

  aws ec2 create-tags \
  --resources subnet-008782c6923aa7218 subnet-0274eba1934b372ee  --region ca-central-1 --profile ausan \
  --tags Key=kubernetes.io/role/elb,Value=1 \
         Key=kubernetes.io/cluster/solid-eks,Value=owned


create tags private

aws ec2 create-tags \
  --resources subnet-09767cf4ce5d988af subnet-0ae8a9c7b0519eb8a --region ca-central-1 --profile ausan \
  --tags Key=kubernetes.io/role/internal-elb,Value=1 \
         Key=kubernetes.io/cluster/solid-eks,Value=owned

kubectl delete pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller


scale more node

eksctl scale nodegroup \
  --cluster solid-eks --region ca-central-1 --profile ausan \
  --name solid-eks-solid-workers \
  --nodes 2
  

test pod on eks

kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl -v http://backend-service.ingress-nginx.svc.cluster.local:80


kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl -v http://kubernetes-dashboard.kubernetes-dashboard.svc.cluster.local:80

  check ingress

  kubectl describe ingress demo-ingress -n demo-app-ns

  chekc alb

  kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller

  aply 

  Ensure Kubernetes RBAC is applied

  kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

  delete alb pods

  kubectl delete pod -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller


  check sa

  kubectl get sa aws-load-balancer-controller -n kube-system -o yaml
  
  install dashboard

  kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml


  get loigin info

  kubectl -n kubernetes-dashboard create token admin-user

