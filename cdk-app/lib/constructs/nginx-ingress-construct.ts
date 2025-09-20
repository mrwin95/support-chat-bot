import { CfnJson, Fn, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Cluster } from "aws-cdk-lib/aws-eks";
import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { AlbIamControllerConstruct } from "./alb-iam-controller-construct";
export interface NginxIngressProps {
  cluster: Cluster;
  ssmPrefix?: string;
}

export class NginxIngressConstruct extends Construct {
  public readonly albRole: iam.IRole;
  private readonly saName = "aws-load-balancer-controller";
  private readonly saNs = "kube-system";

  constructor(scope: Construct, id: string, props: NginxIngressProps) {
    super(scope, id);

    const { cluster, ssmPrefix } = props;

    // Read OIDC info from SSM (exported by EksStack)
    // const oidcArn = ssm.StringParameter.valueForStringParameter(
    //   this,
    //   `${ssmPrefix}OidcProviderArn`
    // );
    // const oidcIssuer = ssm.StringParameter.valueForStringParameter(
    //   this,
    //   `${ssmPrefix}OidcProviderIssuer`
    // );

    // IAM role for controller

    // IAM Role for ALB Controller
    // this.role = new iam.Role(this, "AlbControllerRole", {
    //   roleName: "AwsLoadBalancerControllerRole",
    //   assumedBy: new iam.WebIdentityPrincipal(oidcArn, {
    //     StringEquals: {
    //       [`${oidcIssuer}:sub`]:
    //         "system:serviceaccount:kube-system:aws-load-balancer-controller",
    //     },
    //   }),
    // });

    // 👇 Build dynamic StringEquals map
    // const stringEquals = new CfnJson(this, "AlbOidcCondition", {
    //   value: {
    //     [`${oidcIssuer}:sub`]:
    //       "system:serviceaccount:kube-system:aws-load-balancer-controller",
    //   },
    // });

    // this.role = new iam.Role(this, "AlbControllerRole", {
    //   roleName: "AwsLoadBalancerControllerRole",
    //   assumedBy: new iam.WebIdentityPrincipal(oidcArn, {
    //     StringEquals: stringEquals,
    //   }),
    // });

    // this.role.addManagedPolicy(
    //   iam.ManagedPolicy.fromAwsManagedPolicyName(
    //     "AmazonEKSLoadBalancerControllerPolicy"
    //   )
    // );

    // ServiceAccount
    // const albSa = cluster.addServiceAccount("AlbControllerSA", {
    //   name: "aws-load-balancer-controller",
    //   namespace: "kube-system",
    // });

    // this.role.addManagedPolicy(
    //   iam.ManagedPolicy.fromAwsManagedPolicyName(
    //     "AmazonEKSLoadBalancerControllerPolicy"
    //   )
    // );

    // ServiceAccount bound to this IAM Role
    // const albSa = cluster.addServiceAccount("AlbControllerSA", {
    //   name: "aws-load-balancer-controller",
    //   namespace: "kube-system",
    // });

    // ✅ Import role from SSM (preferred)
    // let albRoleArn: string;
    // if (ssmPrefix) {
    //   albRoleArn = ssm.StringParameter.valueForStringParameter(
    //     this,
    //     `${ssmPrefix}AlbControllerRoleArn`
    //   );
    // } else {
    //   // ✅ fallback: import from CloudFormation export
    //   albRoleArn = Fn.importValue("AlbControllerRoleArn");
    // }

    // Import the role
    // this.role = iam.Role.fromRoleArn(
    //   this,
    //   "ImportedAlbControllerRole",
    //   albRoleArn,
    //   {
    //     mutable: false,
    //   }
    // );

    // 1) Import the ALB Controller role ARN (created in another stack)
    const albRoleArn = ssmPrefix
      ? ssm.StringParameter.valueForStringParameter(
          this,
          `${ssmPrefix}AlbControllerRoleArn`
        )
      : Fn.importValue("AlbControllerRoleArn");

    this.albRole = iam.Role.fromRoleArn(
      this,
      "ImportedAlbControllerRole",
      albRoleArn,
      { mutable: false }
    );

    // 2) Create the ServiceAccount via K8s manifest (so we can set the annotation)
    const saManifest = new eks.KubernetesManifest(this, "AlbControllerSA", {
      cluster,
      manifest: [
        {
          apiVersion: "v1",
          kind: "ServiceAccount",
          metadata: {
            name: this.saName,
            namespace: this.saNs,
            annotations: {
              "eks.amazonaws.com/role-arn": albRoleArn,
            },
            labels: {
              "app.kubernetes.io/name": "aws-load-balancer-controller",
              "app.kubernetes.io/managed-by": "cdk",
            },
          },
        },
      ],
    });

    // ServiceAccount for controller (must match OIDC trust condition)
    // Explicitly create the IAM Role with fixed name
    // const albRole = new iam.Role(this, "AlbControllerRole", {
    //   roleName: "AwsLoadBalancerControllerRole", // fixed name
    //   assumedBy: new iam.WebIdentityPrincipal(
    //     cluster.openIdConnectProvider.openIdConnectProviderArn,
    //     {
    //       StringEquals: {
    //         [`${cluster.openIdConnectProvider.openIdConnectProviderIssuer}:sub`]:
    //           "system:serviceaccount:kube-system:aws-load-balancer-controller",
    //       },
    //     }
    //   ),
    //   managedPolicies: [
    //     iam.ManagedPolicy.fromAwsManagedPolicyName(
    //       "AmazonEKSLoadBalancerControllerPolicy"
    //     ),
    //   ],
    // });

    // Now bind that IAM Role to the ServiceAccount
    // const albSa = cluster.addServiceAccount("AlbControllerSA", {
    //   name: "aws-load-balancer-controller",
    //   namespace: "kube-system",
    // });

    // Explicitly annotate the SA with the IAM Role ARN
    // albSa.node.addDependency(albRole); // ensure role is created first
    // albSa.addPropertyOverride(
    //   "metadata.annotations.eks\\.amazonaws\\.com/role-arn",
    //   albRole.roleArn
    // );

    // const albSa = cluster.addServiceAccount("AlbControllerSA", {
    //   name: "aws-load-balancer-controller",
    //   namespace: "kube-system",
    // });

    // (albSa.role as iam.IRole).applyRemovalPolicy(RemovalPolicy.RETAIN); // optional safety
    // Removed overrideLogicalId as it does not exist on IRole

    // 👇 important: give the role a fixed name

    // Bind SA to IAM Role (annotation added automatically by CDK)
    // albSa.role.attachInlinePolicy(
    //   new iam.Policy(this, "AlbControllerExtraPolicy", {
    //     statements: [
    //       new iam.PolicyStatement({
    //         actions: ["elasticloadbalancing:*"],
    //         resources: ["*"],
    //       }),
    //     ],
    //   })
    // );

    // Attach inline policy (based on AWS docs)
    this.albRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: [
          "acm:DescribeCertificate",
          "acm:ListCertificates",
          "acm:GetCertificate",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:CreateSecurityGroup",
          "ec2:CreateTags",
          "ec2:DeleteTags",
          "ec2:DeleteSecurityGroup",
          "ec2:Describe*",
          "ec2:Modify*",
          "elasticloadbalancing:*",
          "iam:CreateServiceLinkedRole",
          "iam:GetServerCertificate",
          "iam:ListServerCertificates",
          "iam:PassRole",
          "waf-regional:*",
          "wafv2:*",
          "shield:*",
        ],
        resources: ["*"],
      })
    );
    // const albPolicy = new iam.ManagedPolicy(this, "AlbControllerPolicy", {
    //   managedPolicyName: "AlbControllerPolicy", // 👈 important for cross-env
    //   statements: [
    //     new iam.PolicyStatement({
    //       actions: [
    //         "acm:DescribeCertificate",
    //         "acm:ListCertificates",
    //         "acm:GetCertificate",
    //         "ec2:AuthorizeSecurityGroupIngress",
    //         "ec2:CreateSecurityGroup",
    //         "ec2:CreateTags",
    //         "ec2:DeleteTags",
    //         "ec2:DeleteSecurityGroup",
    //         "ec2:Describe*",
    //         "ec2:Modify*",
    //         "elasticloadbalancing:*",
    //         "iam:CreateServiceLinkedRole",
    //         "iam:GetServerCertificate",
    //         "iam:ListServerCertificates",
    //         "iam:PassRole",
    //         "waf-regional:*",
    //         "wafv2:*",
    //         "shield:*",
    //       ],
    //       resources: ["*"],
    //     }),
    //   ],
    // });

    // albSa.role.addManagedPolicy(albPolicy);

    // albSa.role.addManagedPolicy(
    //   iam.ManagedPolicy.fromAwsManagedPolicyName(
    //     "AmazonEKSLoadBalancerControllerPolicy"
    //   )
    // );

    // Create SA bound to that role
    // const albSa = cluster.addServiceAccount("AlbControllerSA", {
    //   name: "aws-load-balancer-controller",
    //   namespace: "kube-system",
    // });
    // albSa.role.addManagedPolicy(
    //   iam.ManagedPolicy.fromAwsManagedPolicyName(
    //     "AmazonEKSLoadBalancerControllerPolicy"
    //   )
    // );

    // const iamController = new AlbIamControllerConstruct(this, "AlbIam", {
    //   cluster,
    //   roleName: "AwsLoadBalancerControllerRole",
    // });

    // const albSA = cluster.addServiceAccount("AlbControllerSA", {
    //   name: "aws-load-balancer-controller",
    //   namespace: "kube-system",
    // });

    // iamController.role.attachInlinePolicy(
    //   new iam.Policy(this, "AlbControllerInlinePolicy", {
    //     statements: [], // optional extras
    //   })
    // );

    // // This is the key line: link ServiceAccount to the IAM Role
    // albSA.role.addManagedPolicy(
    //   iam.ManagedPolicy.fromAwsManagedPolicyName(
    //     "AmazonEKSLoadBalancerControllerPolicy"
    //   )
    // );

    // albSA.node.addDependency(iamController.role);
    // albSA.addAnnotation(
    //   "eks.amazonaws.com/role-arn",
    //   iamController.role.roleArn
    // );

    // iamController.role.grantAssumeRole(albSA.role);

    // albSA.role.addManagedPolicy(
    //   iam.ManagedPolicy.fromAwsManagedPolicyName(
    //     "AmazonEKSLoadBalancerControllerPolicy"
    //   )
    // );

    // 1. Install AWS Load Balancer Controller (ALB ingress)
    const albController = cluster.addHelmChart("AlbController", {
      chart: "aws-load-balancer-controller",
      repository: "https://aws.github.io/eks-charts",
      release: "aws-load-balancer-controller",
      namespace: "kube-system",
      version: "1.9.2", // pick one that matches your cluster version
      values: {
        clusterName: cluster.clusterName,
        region: Stack.of(this).region,
        vpcId: cluster.vpc.vpcId,
        serviceAccount: {
          create: false,
          name: this.saName,
        },
      },
    });
    // Ensure SA exists before Helm mutating webhooks run
    albController.node.addDependency(saManifest);

    // albController.node.addDependency(albSA);

    // 2. Install NGINX Ingress
    cluster.addHelmChart("NginxIngress", {
      chart: "ingress-nginx",
      repository: "https://kubernetes.github.io/ingress-nginx",
      release: "nginx-ingress",
      namespace: "ingress-nginx",
      version: "4.11.0",
      values: {
        controller: {
          admissionWebhooks: { enabled: false }, // avoid webhook clash w/ ALB
          service: { type: "NodePort" },
          minReadySeconds: 5,
          progressDeadlineSeconds: 600,
        },
      },
    });
  }
}
