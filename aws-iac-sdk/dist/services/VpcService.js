"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VpcService = void 0;
const distTypes = require("@aws-sdk/client-ec2");
const client_ec2_1 = require("@aws-sdk/client-ec2");
class VpcService {
    ec2;
    constructor(region) {
        this.ec2 = new client_ec2_1.EC2Client({ region: region });
    }
    async createVpc(cidrBlock, name) {
        const vpc = await this.ec2.send(new distTypes.CreateVpcCommand({ CidrBlock: cidrBlock }));
        const vpcId = vpc.Vpc?.VpcId;
        // add tag
        await this.ec2.send(new client_ec2_1.CreateTagsCommand({
            Resources: [vpcId],
            Tags: [
                {
                    Key: "Name",
                    Value: name,
                },
            ],
        }));
        console.log(`Created VPC: ${vpcId} (${cidrBlock})`);
        return vpcId;
    }
    listVpcs() {
        throw new Error("Method not implemented.");
    }
    deleteVpc(vpcId) {
        throw new Error("Method not implemented.");
    }
}
exports.VpcService = VpcService;
//# sourceMappingURL=VpcService.js.map