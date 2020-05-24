import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
// import * as AWS from 'aws-sdk'
import { UpdateConnectionRequest } from '../../requests/updateConnectionRequest'
// import * as moment from 'moment-timezone'
import { getOAuthUId } from '../../utils/oauthIdGetter'
import { updateConnection } from '../../bizlogic/connections'
// import * as axios from 'axios'

// const docClient = new AWS.DynamoDB.DocumentClient()
// const connectionsTable = process.env.CONNECTIONS_TABLE
// const nonUserUsersTable = process.env.NONUSER_USERS_TABLE
// const usersTable = process.env.USERS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing update connections event', event)
  const connectionId = event.pathParameters.connectionId
  const updateConnectionRequest : UpdateConnectionRequest = JSON.parse(event.body)
  if (updateConnectionRequest == null
    || updateConnectionRequest.firstName == undefined
    || updateConnectionRequest.lastName == undefined
    || updateConnectionRequest.company == undefined
    || updateConnectionRequest.title == undefined) {

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
  console.log("After validated updateConnectionRequests")
  updateConnectionRequest.nonUserUId = connectionId
  const oauthUId = getOAuthUId(event)
  try {
    await updateConnection(updateConnectionRequest, oauthUId) 
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
      msg: 'Successfully updated'
    })
  }
}
//   // Check if current user exists in database (based on oauthid)
//   const oauthUId = getOAuthUId(event)
//   const result = await docClient.query({
//     TableName: usersTable,
//     IndexName: process.env.OAUTH_UID_INDEX,
//     KeyConditionExpression: 'oauthUId = :oauthUId',
//     ExpressionAttributeValues: {
//         ':oauthUId': oauthUId
//     },
//     ScanIndexForward: false
//   }).promise()
//   if (result.Count == 0 || result.Count > 1) {
//     return {
//       statusCode: 401,
//       headers: {
//         'Access-Control-Allow-Origin': '*'
//       },
//       body: JSON.stringify({
//         errMsg: 'Unauthorized request'
//       })
//     }
//   }
 
//   // Get the userId of the current login user
//   var userId : string
//   for (let user of result.Items) {
//     userId = user['userId']
//   }

//   // Check if the namecardUrl is valid
//   var headStatusCode : number
//   axios.default.head('https://www.google.com').then((response) => {
//     headStatusCode = response.status
//   }).catch(() => {
//     headStatusCode = 401    
//   })
//   if (headStatusCode != 200) {
//     return {
//       statusCode: 401,
//       headers: {
//         'Access-Control-Allow-Origin': '*'
//       },
//       body: JSON.stringify({
//         errMsg: 'namecardUrl is invalid'        
//       })
//     }
//   }

//   // Update the nonUsersTable
//   const now = moment().format()
//   var updateNonUsersTableStr : string = "set firstName= :fn, lastName= :ln, company= :c, title= :t, updatedAt= :ua"
//   const updateNonUsersTableResult = await docClient.update({
//     TableName: nonUserUsersTable,
//     Key: {
//       nonUserUId: connectionId
//     },
//     UpdateExpression: updateNonUsersTableStr,
//     ExpressionAttributeValues: {
//       ':fn': updateConnectionRequest.firstName,
//       ':ln': updateConnectionRequest.lastName,
//       ':c': updateConnectionRequest.company,
//       ':t': updateConnectionRequest.title,
//       ':ua': now
//     }
//   }).promise()
//   if (updateNonUsersTableResult.$response.error != null) {
//     return {
//       statusCode: 400,
//       headers: {
//         'Access-Control-Allow-Origin': '*'
//       },
//       body: JSON.stringify({
//         errMsg: updateNonUsersTableResult.$response.error
//       })
//     }
//   }

//   // Update the connections table
//   var updateConnTableStr = "set updatedAt= :ua"
//   var params
//   if (updateConnectionRequest.namecardUrl != undefined) {
//     updateConnTableStr += ", namecardUrl= :nu"
//     params = {
//       TableName: connectionsTable,
//       Key: {
//         userId: userId,
//         connectionId: connectionId
//       },
//       UpdateExpression: updateConnTableStr,
//       ExpressionAttributeValues: {
//         ":nu": updateConnectionRequest.namecardUrl,
//         ":ua": now
//       }
//     }
//   } else {
//     params = {
//       TableName: connectionsTable,
//       Key: {
//         userId: userId,
//         connectionId: connectionId
//       },
//       UpdateExpression: updateConnTableStr,
//       ExpressionAttributeValues: {
//         ":ua": now
//       }
//     }
//   }
//   const updateConnTableResult = await docClient.update(params).promise()
//   if (updateConnTableResult.$response.error != null) {
//     return {
//       statusCode: 400,
//       headers: {
//         'Access-Control-Allow-Origin': '*'
//       },
//       body: JSON.stringify({
//         errMsg: updateConnTableResult.$response.error
//       })
//     }
//   }

//   return {
//     statusCode: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*'
//     },
//     body: JSON.stringify({
//       msg: 'Successfully updated'
//     })
//   }
// }
