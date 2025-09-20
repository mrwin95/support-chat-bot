ENV ?= dev
ENV_FILE = env/.env.$(ENV)
include $(ENV_FILE)
export $(shell sed 's/=.*//' $(ENV_FILE))

#CDK_ENV_FILE= env/.env.$(ENV)
#export $(shell sed 's/=.*//' $(CDK_ENV_FILE))

.PHONY: help init build test synth diff deploy destroy logs
bootstrap:
	@echo "Bootstrapping CDK for ${CDK_ENV}"
	cdk bootstrap aws://${AWS_ACCOUNT}/$(AWS_REGION)
bootstrap-dev:
	ENV=$(ENV) npx cdk deploy ConfigBootstrapDev --require-approval never
bootstrap-prod:
	ENV=$(ENV) npx cdk deploy ConfigBootstrapProd --require-approval never

# build: npm run build

# synth: build
# 	npx cdk synth
# deploy: build
# 	ENV=$(ENV) npx cdk deploy --require-approval never
# deploy:
# 	ENV=$(ENV) npx cdk destroy --force
init:
	@echo "Install dependencies..."
	npm install
build:
	@echo "Build typescript..."
	npm run build
test:
	@echo "Running tests..."
	npm run test
synth: build
	@echo "Synthesizing Cloudformation..."
	npx cdk synth

diff:
	@echo "Checking differences..."
	npx cdk diff
deploy:
	@echo "Deploying to $(ENV) environment..."
	npx cdk deploy --require-approval never
deploy-iam:
	@echo "Deploying to $(ENV) environment..."
	npx cdk deploy IamStack --require-approval never


deploy-vpc:
	@echo "Deploying to $(ENV) environment..."
	npx cdk deploy NetworkStack --require-approval never

deploy-eks:
	@echo "Deploying to $(ENV) environment..."
	npx cdk deploy EksStack --require-approval never
deploy-addon:
	@echo "Deploying to $(ENV) environment..."
	npx cdk deploy EksAddOnStack --require-approval never
deploy-admin-user:
	@echo "Deploying to $(ENV) environment..."
	npx cdk deploy EksAdminUserStack --require-approval never
deploy-ingress:
	@echo "Deploying to $(ENV) environment..."
	npx cdk deploy IngressStack --require-approval never
deploy-irsa:
	@echo "Deploying to $(ENV) environment..."
	npx cdk deploy IrsaRoleStack --require-approval never


destroy:
	@echo "Destroying stack for $(ENV) environment..."
	npx cdk destroy
destroy-vpc:
	@echo "Destroying stack for $(ENV) environment..."
	npx cdk destroy NetworkStack
destroy-eks:
	@echo "Destroying stack for $(ENV) environment..."
	npx cdk destroy EksStack
destroy-addon:
	@echo "Destroying stack for $(ENV) environment..."
	npx cdk destroy EksAddOnStack

destroy-admin-user:
	@echo "Destroying stack for $(ENV) environment..."
	npx cdk destroy EksAdminUserStack
destroy-ingress:
	@echo "Destroying stack for $(ENV) environment..."
	npx cdk destroy IngressStack
	
logs:
	@echo "Fetching Cloudwatch logs..."
	aws logs describe-log-groups --region $(AWS_REGION)