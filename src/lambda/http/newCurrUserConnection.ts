import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getOAuthUId } from '../../utils/oauthIdGetter'
import { NewCurrUserConnectionRequest } from '../../requests/newCurrUserConnectionRequest'
import { addCurrUserAsConnection } from '../../bizlogic/connections'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing new current user connection event', event)
  var newCurrUserConnReq : NewCurrUserConnectionRequest = JSON.parse(event.body)
  console.log("The connectionoauthid is " + newCurrUserConnReq.connectionId)
  if (newCurrUserConnReq == null) {
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
  try {
    await addCurrUserAsConnection(newCurrUserConnReq.connectionId, oauthUId);
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
      connectionId: newCurrUserConnReq.connectionId
    })
  }
}
