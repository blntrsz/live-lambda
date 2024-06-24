import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { IotCore } from './iot-core.js';
import { join } from 'path'
import { Duration } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

interface LambdaProps {
  entry: string
  region?: string
}

export class Lambda extends Construct {
  handler: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaProps) {
    super(scope, id)

    const { iotUrl } = new IotCore(this, 'iot', {
      region: props.region
    })

    const isLocal = this.node.tryGetContext('local')

    this.handler = new NodejsFunction(this, 'lambda', {
      entry: isLocal ? join(import.meta.dirname, './dummy-handler.ts') : props.entry,
      timeout: isLocal ? Duration.minutes(2) : Duration.seconds(30),
      environment: {
        IOT_URL: iotUrl,
        STAGE: 'balint',
        ENTRY: props.entry
      },
    })

    this.handler.addToRolePolicy(
      new PolicyStatement({
        actions: ["*"],
        resources: ["*"]
      })
    )
  }
}

