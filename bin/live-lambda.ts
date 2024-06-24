#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LiveLambdaStack } from '../lib/live-lambda-stack.js';

const app = new cdk.App();
new LiveLambdaStack(app, 'LiveLambdaStack');
