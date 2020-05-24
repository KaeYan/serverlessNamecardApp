import { UserDbAccess } from '../dbaccess/userDbAccess'
import { ConnectionDbAccess } from '../dbaccess/connectionDbAccess'
import { ConnectionDetails } from '../requests/connectionDetails'
import * as uuid from 'uuid'
import { getUserDetails } from '../bizlogic/users'
import { NewNonUserConnectionRequest } from '../requests/newNonUserConnectionRequest'
import * as moment from 'moment-timezone'
import { UpdateConnectionRequest } from '../requests/updateConnectionRequest'
import * as axios from 'axios'

const userDbAccess = new UserDbAccess()
const connectionDbAccess = new ConnectionDbAccess()

export async function getConnectionsDetails(noOfRecords: number, oauthUId: string): Promise<ConnectionDetails[]> {
    var userId : uuid
    try {        
        userId = await userDbAccess.checkIfUsersExistsByOAuthID(oauthUId)
        if (userId == null) {
            throw new Error('Unauthorized request')
        }
    } catch (err) {
        throw err
    }
    // Get a list of connections
    var connectionList : ConnectionDetails[] = null
    try {
        connectionList = await connectionDbAccess.GetConnectionList(noOfRecords, userId)
    } catch (err) {
        throw err
    }
    // From the list of connections, add in the details
    for (const conn of connectionList) {
        const userinfo = await getUserDetails(conn.isNonUser, conn.connectionId)
        if (userinfo != null) {
          conn.firstName = userinfo.firstName
          conn.lastName = userinfo.lastName
          conn.title = userinfo.title
          conn.namecardUrl = userinfo.namecardUrl
          conn.company = userinfo.company
        }
        console.log("The connection is " + conn)
    }
    return connectionList
}

export async function addCurrUserAsConnection(oauthUIdToAdd: string, oauthUId: string) {
    var userId: uuid
    try {        
        userId = await userDbAccess.checkIfUsersExistsByOAuthID(oauthUId)
        if (userId == null) {
            throw new Error('Unauthorized request')
        }
    } catch (err) {
        throw err
    }
    // Check if the connection is in our userbase
    var userIdToAdd: uuid
    try {        
        userIdToAdd = await userDbAccess.checkIfUsersExistsByOAuthID(oauthUIdToAdd)
        if (userIdToAdd == null) {
            throw new Error('The new connection is not a valid user')
        }
    } catch (err) {
        throw err
    }
    // Add the new connection with connection's userId
    await connectionDbAccess.AddConnection(userId, userIdToAdd, false)
}

export async function addNonUserAsConnection(newNonUserConnectionRequest: NewNonUserConnectionRequest, oauthUId: string): Promise<uuid> {
    var userId: uuid
    try {        
        userId = await userDbAccess.checkIfUsersExistsByOAuthID(oauthUId)
        if (userId == null) {
            throw new Error('Unauthorized request')
        }
    } catch (err) {
        throw err
    }
    // Add the connection as an anonymous user in our userbase
    const connectionId = uuid.v4()
    const now = moment().format()
    const nonUserDbModel = {
        nonUserUId: connectionId,
        firstName: newNonUserConnectionRequest.firstName,
        lastName: newNonUserConnectionRequest.lastName,
        company: newNonUserConnectionRequest.company,
        title: newNonUserConnectionRequest.title,
        createdAt: now,
        updatedAt: now
    }
    await userDbAccess.AddNonUser(nonUserDbModel)
    await connectionDbAccess.AddConnection(userId, connectionId, true)
    return connectionId
}

export async function updateConnection(updateConnectionRequest: UpdateConnectionRequest, 
    oauthUId: string): Promise<uuid> {
    
    var userId: uuid
    try {        
        userId = await userDbAccess.checkIfUsersExistsByOAuthID(oauthUId)
        if (userId == null) {
            throw new Error('Unauthorized request')
        }
    } catch (err) {
        throw err
    }
    console.log("After checking that user is in our userbase")
    // Check if the namecard url is valid
    if (updateConnectionRequest.namecardUrl != undefined) {
        console.log("Checking if the namecard url is valid")
        axios.default.head(updateConnectionRequest.namecardUrl).then((response) => {
            if (response.status != 200) {
                throw new Error('namecard url is not valid')
            }
        }).catch(() => {
            throw new Error('namecard url is not valid')
        })
    }
    // Update the nonUsersTable
    console.log("Updating non user in db")
    await userDbAccess.UpdateNonUser(updateConnectionRequest)
    console.log("Updating connection in db")
    await connectionDbAccess.UpdateConnection(userId, updateConnectionRequest)
}