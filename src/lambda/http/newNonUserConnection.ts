import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { NewNonUserConnectionRequest } from '../../requests/newNonUserConnectionRequest'
import { getOAuthUId } from '../../utils/oauthIdGetter'
import { addNonUserAsConnection } from '../../bizlogic/connections'
import { UUID } from 'aws-sdk/clients/inspector'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing new non user connection event', event)
  var newNonUserConnectionRequest : NewNonUserConnectionRequest = JSON.parse(event.body)
  if (newNonUserConnectionRequest == null) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        errMsg: 'request body is missing or missing field'
      })
    }
  }
  const oauthUId = getOAuthUId(event)
  var connectionId: UUID
  try {
    connectionId = await addNonUserAsConnection(newNonUserConnectionRequest, oauthUId)
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        errMsg: err.message
      })
    }
  }
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      connectionId: connectionId
    })
  }
}