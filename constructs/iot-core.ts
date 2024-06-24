import * as cdk from "aws-cdk-lib";
import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  AwsSdkCall,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

interface IotCoreProps {
  region?: string
}

export class IotCore extends Construct {
  iotUrl: string;
  constructor(scope: Construct, id: string, props: IotCoreProps) {
    super(scope, id);

    const describeEndpointRole = new Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    describeEndpointRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );

    describeEndpointRole.addToPolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: ["iot:DescribeEndpoint"],
      }),
    );

    const describeEndpointSdkCall: AwsSdkCall = {
      service: "Iot",
      action: "describeEndpoint",
      parameters: {
        endpointType: "iot:Data-ATS",
      },
      region: props.region,
      physicalResourceId: PhysicalResourceId.of("IoTEndpointDescription"),
    };

    const describeEndpointResource = new AwsCustomResource(this, "Resource", {
      onCreate: describeEndpointSdkCall,
      onUpdate: describeEndpointSdkCall,
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
      role: describeEndpointRole,
    });

    this.iotUrl = describeEndpointResource.getResponseField("endpointAddress")

    new cdk.CfnOutput(this, "iot url", {
      value: describeEndpointResource.getResponseField("endpointAddress"),
    });
  }
}
