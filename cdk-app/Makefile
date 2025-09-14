ENV ?= env
bootstrap:
	@echo "Bootstrapping CDK for ${ENV}"
	cdk bootstrap aws://${AWS_ACCOUNT}/$(AWS_REGION)
bootstrap-dev:
	ENV=$(ENV) npx cdk deploy ConfigBootstrapDev --require-approval never
bootstrap-prod:
	ENV=$(ENV) npx cdk deploy ConfigBootstrapProd --require-approval never

build: npm run build

synth: build
	npx cdk synth
deploy: build
	ENV=$(ENV) npx cdk deploy --require-approval never
deploy:
	ENV=$(ENV) npx cdk destroy --force