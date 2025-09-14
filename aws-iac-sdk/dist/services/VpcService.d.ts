import type INetworkService = require("../interfaces/INetworkService");
export declare class VpcService implements INetworkService.INetworkService {
    private ec2;
    constructor(region: string);
    createVpc(cidrBlock: string, name: string): Promise<string>;
    listVpcs(): Promise<{
        vpcId: string;
        cidrBlock: string;
        name?: string;
    }>;
    deleteVpc(vpcId: string): Promise<void>;
}
//# sourceMappingURL=VpcService.d.ts.map