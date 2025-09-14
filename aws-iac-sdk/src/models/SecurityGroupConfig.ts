export interface SecurityGroupConfig {
  name: string;
  description: string;
  ingressRules: {
    protocol: string;
    fromPort: string;
    toPort: string;
    cidr: string;
  }[];
}
