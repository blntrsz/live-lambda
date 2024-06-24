import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { Lambda } from '../constructs/lambda.js';

export class LiveLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new Lambda(this, 'lambda', {
      entry: './lib/handler.ts',
      region: props?.env?.region
    }).handler

    const url = handler.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE
    })

    new cdk.CfnOutput(this, "url", {
      value: url.url
    });
  }
}
