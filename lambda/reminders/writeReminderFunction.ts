import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log(`API Gateway RequestID: ${event.requestContext.requestId}`);

  return {
    statusCode: 200,
    body: "OK",
  };
}
