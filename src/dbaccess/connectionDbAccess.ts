import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { ConnectionDetails } from '../requests/connectionDetails'
import * as moment from 'moment-timezone'
import { bool } from 'aws-sdk/clients/signer'
import { UpdateConnectionRequest } from '../requests/updateConnectionRequest'

export class ConnectionDbAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly connectionsTable = process.env.CONNECTIONS_TABLE
    ) {}

    async GetConnectionList(noOfRecords: number, userId: string): Promise<ConnectionDetails[]> {
        const connectionList = await this.docClient.query({
            TableName: this.connectionsTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            Limit: noOfRecords,
            ScanIndexForward: false
        }).promise()
        if (connectionList.$response.error != null) {
            throw connectionList.$response.error
        }
        if (connectionList.Items.length == 0) {
            return []
        }
        var cds : ConnectionDetails[] = []
        for (const connection of connectionList.Items) {
            var cd : ConnectionDetails = JSON.parse(JSON.stringify(connection))
            cd.connectionId = connection["connectionId"]
            if (connection["isNonUser"] == true) {
                cd.isNonUser = true
            } else {
                cd.isNonUser = false
            }
            cds.push(cd)
        }
        return cds
    }

    async AddConnection(userId: string, userIdToAdd: string, isNonUser: bool) {
        const now = moment().format();
        const connectionDbModel = {
            userId: userId,
            connectionId: userIdToAdd,
            isNonUser: isNonUser,
            createdAt: now,
            updatedAt: now
        }
        const result = await this.docClient.put({
            TableName: this.connectionsTable,
            Item: connectionDbModel
        }).promise()
        if (result.$response.error != null) {
            throw result.$response.error
        }
    }

    async UpdateConnection(userId: string, updateConnectionRequest: UpdateConnectionRequest, ) {
        const now = moment().format();
        var updateConnTableStr = "set updatedAt= :ua"
        var params
        if (updateConnectionRequest.namecardUrl != undefined) {
            updateConnTableStr += ", namecardUrl= :nu"
                params = {
                TableName: this.connectionsTable,
                Key: {
                    userId: userId,
                    connectionId: updateConnectionRequest.nonUserUId
                },
                UpdateExpression: updateConnTableStr,
                ExpressionAttributeValues: {
                    ":nu": updateConnectionRequest.namecardUrl,
                    ":ua": now
                }
            }
        } else {
            params = {
                TableName: this.connectionsTable,
                Key: {
                    userId: userId,
                    connectionId: updateConnectionRequest.nonUserUId
                },
                UpdateExpression: updateConnTableStr,
                ExpressionAttributeValues: {
                    ":ua": now
                }
            }
        }
        const result = await this.docClient.update(params).promise()
        if (result.$response.error != null) {
            throw result.$response.error
        }
    }
}