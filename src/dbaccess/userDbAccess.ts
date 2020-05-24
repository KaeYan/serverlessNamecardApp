import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { UserAccess } from "../requests/userAccess"
import { NonUser } from '../dbaccess/models/NonUser'
import * as moment from 'moment-timezone'
import { UserUpdateRequest } from '../requests/updateUserRequest'
import { UpdateConnectionRequest } from '../requests/updateConnectionRequest'

export class UserDbAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly usersTable = process.env.USERS_TABLE,
        private readonly nonUsersTable = process.env.NONUSER_USERS_TABLE
    ) {}

    async checkIfUsersExistsByOAuthID(oauthUId: string): Promise<uuid> {
        const result = await this.docClient.query({
            TableName: this.usersTable,
            IndexName: process.env.OAUTH_UID_INDEX,
            KeyConditionExpression: 'oauthUId = :oauthUId',
            ExpressionAttributeValues: {
                ':oauthUId': oauthUId
            },
            ScanIndexForward: false
        }).promise()
        if (result.$response.error != null) {
            throw result.$response.error
        }
        // If no record is found
        if (result.Count == 0) {
            console.log("No record is found")
            return null
        }
        for (let user of result.Items) {
            return user['userId']
        }
    }
    
    async AddNonUser(nonUserModel: NonUser): Promise<uuid> {
        const result = await this.docClient.put({
            TableName: this.nonUsersTable,
            Item: nonUserModel
        }).promise()
        if (result.$response.error != null) {
            throw result.$response.error
        }
    }

    async AddUser(userAccessReqBody: UserAccess, oauthUId: string): Promise<uuid> {
        const userId = uuid.v4()
        const newUser = {
            userId: userId,
            oauthUId: oauthUId,
            firstName: userAccessReqBody.firstName,
            lastName: userAccessReqBody.lastName,
            createdAt: moment().format(),
        }
        const result = await this.docClient.put({
            TableName: this.usersTable,
            Item: newUser
        }).promise()
        if (result.$response.error != null) {
            throw result.$response.error
        }
        return userId
    }

    async UpdateUser(UserUpdateReqBody: UserUpdateRequest, userId: string) {
        const result = await this.docClient.update({
            TableName: this.usersTable,
            Key: {
                userId: userId,
            },
            UpdateExpression: 
                "set firstName=:fName, lastName=:lName, title=:tt, company=:cpy, namecardUrl=:nUrl, profileUrl=:pUrl",
            ExpressionAttributeValues: {
                ":fName": UserUpdateReqBody.firstName,
                ":lName": UserUpdateReqBody.lastName,
                ":tt": UserUpdateReqBody.title,
                ":cpy": UserUpdateReqBody.company,
                ":nUrl": UserUpdateReqBody.namecardUrl,
                ":pUrl": UserUpdateReqBody.profileUrl
            }
        }).promise()
        if (result.$response.error != null) {
            throw result.$response.error
        }
    }

    async UpdateNonUser(updateConnectionRequest: UpdateConnectionRequest) {
        const now = moment().format()
        var updateNonUsersTableStr : string = "set firstName= :fn, lastName= :ln, company= :c, title= :t, updatedAt= :ua"
        const result = await this.docClient.update({
            TableName: this.nonUsersTable,
            Key: {
                nonUserUId: updateConnectionRequest.nonUserUId
            },
            UpdateExpression: updateNonUsersTableStr,
            ExpressionAttributeValues: {
            ':fn': updateConnectionRequest.firstName,
            ':ln': updateConnectionRequest.lastName,
            ':c': updateConnectionRequest.company,
            ':t': updateConnectionRequest.title,
            ':ua': now
            }
        }).promise()
        if (result.$response.error != null) {
            throw result.$response.error
        }
    }

    async getUserDetails(isNonUser: boolean, userId: string): Promise<UserAccess> {
        var user
        if (!isNonUser) {
            user = await this.docClient.query({
                TableName: this.usersTable,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
            }).promise()
        } else {
            user = await this.docClient.query({
                TableName: this.nonUsersTable,
                KeyConditionExpression: 'nonUserUId = :nonUserUId',
                ExpressionAttributeValues: {
                    ':nonUserUId': userId
                },
            }).promise()
        }
        if (user.$response.error != null) {
            throw user.$response.error
        }
        if (user.Items.length == 0) {
            return null
        }
        const useraccess : UserAccess = JSON.parse(JSON.stringify(user.Items[0]))
        return useraccess
    }
}