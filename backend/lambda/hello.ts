import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (_) => {
  return {
    statusCode: 200,
    isBase64Encoded: false,
    body: 'Hello World! You are successfully authorized with Cognito!',
  };
};
