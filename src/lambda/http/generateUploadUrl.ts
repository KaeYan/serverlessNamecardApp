import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getOAuthUId } from '../../utils/oauthIdGetter'
import { getUploadKeyAndUrl } from '../../bizlogic/uploadUrls'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing generate upload url event', event)
    const oauthUId = getOAuthUId(event)
    var uploadKeyAndUrl: string[]
    try {
        uploadKeyAndUrl = await getUploadKeyAndUrl(oauthUId);
    } catch (err) {
        return {
            statusCode: 200,
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
            uploadUrl: uploadKeyAndUrl[1],
            namecardUrl: `https://${process.env.NAMECARDS_S3_BUCKET}.s3.amazonaws.com/${uploadKeyAndUrl[0]}`
        })
    }
}