import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getOAuthUId } from '../../utils/oauthIdGetter'
import { ConnectionDetails } from '../../requests/connectionDetails'
import { getConnectionsDetails } from '../../bizlogic/connections'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing get connections event', event)
  const oauthUId = getOAuthUId(event)
  var connDetails: ConnectionDetails[]
  try {
    connDetails = await getConnectionsDetails(20, oauthUId)
  } catch (err) {
    console.log('Caught exception calling getConnectionsDetails')
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
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: connDetails
    })
  }  
}
