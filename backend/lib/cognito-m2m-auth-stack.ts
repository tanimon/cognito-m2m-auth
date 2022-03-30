import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { AuthorizationType } from 'aws-cdk-lib/aws-apigateway';

export class CognitoM2MAuthStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'M2MAuthRestApi', {
      restApiName: 'M2MAuthRestApi',
    });

    const userPool = new cognito.UserPool(this, 'M2MAuthUserPool', {
      userPoolName: 'M2MAuthUserPool',
    });

    userPool.addDomain('M2MAuthCognitoDomain', {
      cognitoDomain: {
        domainPrefix: 'm2m-auth-sample-domain',
      },
    });

    const resourceServerId = 'example.com';
    const scopeName = 'read';
    const readScope = new cognito.ResourceServerScope({
      scopeName: scopeName,
      scopeDescription: 'Read access to the resource',
    });
    userPool.addResourceServer('M2MAuthResourceServer', {
      identifier: resourceServerId,
      scopes: [readScope],
    });

    const scopeId = `${resourceServerId}/${scopeName}`;
    userPool.addClient('M2MAuthClient', {
      userPoolClientName: 'M2MAuthClient',
      generateSecret: true,
      oAuth: {
        flows: {
          clientCredentials: true,
        },
        scopes: [
          {
            scopeName: scopeId,
          },
        ],
      },
    });

    const authorizer = new apigateway.CfnAuthorizer(this, 'M2MAuthorizer', {
      name: 'CognitoAuthorizer',
      restApiId: api.restApiId,
      type: AuthorizationType.COGNITO,
      identitySource: 'method.request.header.Authorization',
      providerArns: [userPool.userPoolArn],
    });

    const lambdaFunc = new lambda.Function(this, 'HelloFunc', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler',
    });

    const helloResource = api.root.addResource('hello');
    helloResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(lambdaFunc),
      {
        authorizationScopes: [scopeId],
        authorizer: {
          authorizationType: apigateway.AuthorizationType.COGNITO,
          authorizerId: authorizer.ref,
        },
      }
    );
  }
}
