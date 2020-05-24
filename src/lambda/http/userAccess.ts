import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getOAuthUId } from '../../utils/oauthIdGetter'
import { UserAccess } from '../../requests/userAccess'
import { createUser } from '../../bizlogic/users'
import * as uuid from 'uuid'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing user access', event)
    // Get the request body
    const userAccessReqBody : UserAccess = JSON.parse(event.body)
    // Get the oauthid
    const oauthUId = getOAuthUId(event)
    // Delegate to the biz logic to create the user
    var userId : uuid
    try {
        userId = await createUser(userAccessReqBody, oauthUId)               
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
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            userId: userId
        })
    }
}