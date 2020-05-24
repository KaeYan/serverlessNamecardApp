import { APIGatewayProxyEvent } from "aws-lambda";
import { parseOAuthUId } from "./oauthIdParser";

/**
 * Get a oauth id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a oauth id from a JWT token
 */
export function getOAuthUId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseOAuthUId(jwtToken)
}