export interface SecurityGroupConfig {
  name: string;
  description: string;
  ingressRules: {
    protocol: string;
    fromPort: number;
    toPort: number;
    cidr: string;
  }[];
}
