import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getOAuthUId } from '../../utils/oauthIdGetter'
import { UserUpdateRequest } from '../../requests/updateUserRequest'
import { UpdateUser } from '../../bizlogic/users'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing user update', event)
    // Get the request body
    const userUpdateReqBody : UserUpdateRequest = JSON.parse(event.body)
    // Get the oauthid
    const oauthUId = getOAuthUId(event)
    // Update the user
    try {
        await UpdateUser(userUpdateReqBody, oauthUId)
    } catch (err) {
        var code = 400
        if (err.message == 'Unauthorized request') {
            code = 401
        }
        return {
            statusCode: code,
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
            message: "user information updated"
        })
    }
}