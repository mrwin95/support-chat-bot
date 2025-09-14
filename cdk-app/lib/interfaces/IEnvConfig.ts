import { INetworkConfig } from "./INetworkConfig";

export interface IEnvConfig {
  envName: string;
  awsAccount: string;
  awsRegion: string;
  network: INetworkConfig;
}
