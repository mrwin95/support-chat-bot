import { INetworkService } from "../interfaces/INetworkService";
export declare class LoggingNetworkService implements INetworkService {
    private service;
    constructor(service: INetworkService);
    createVpc(cidrBlock: string, name: string): Promise<string>;
    listVpcs(): Promise<{
        vpcId: string;
        cidrBlock: string;
        name?: string;
    }>;
    deleteVpc(vpcId: string): Promise<void>;
}
//# sourceMappingURL=LoggingNetworkService.d.ts.map