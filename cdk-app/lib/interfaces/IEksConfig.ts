export interface IEksConfig {
  clusterName: string;
  version: string;
  minSize?: number;
  maxSize?: number;
  desiredSize?: number;
  instanceType: string;
  nodeGroupName: string;
}
