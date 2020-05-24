import 'source-map-support/register'
import { UserDbAccess } from '../dbaccess/userDbAccess'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

const userDbAccess = new UserDbAccess()
const bucketName = process.env.NAMECARDS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

export async function getUploadKeyAndUrl(oauthUId: string): Promise<string[]> {
    var userId : uuid
    try {        
        userId = await userDbAccess.checkIfUsersExistsByOAuthID(oauthUId)
        if (userId == null) {
            throw new Error('Unauthorized request')
        }
    } catch (err) {
        throw err
    }

    // Get the signed url for the attachment
    const uploadurlKey = uuid.v4()
    const uploadurl = await s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: uploadurlKey,
        Expires: urlExpiration,
    })

    return [uploadurlKey, uploadurl]
}