export interface IResource<TConfig> {
  createVpc(config: TConfig): Promise<string>;
  listVpcs(): Promise<any>;
  deleteVpc(resourceId: string): Promise<void>;
}
