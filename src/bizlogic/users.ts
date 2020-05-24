import { UserAccess } from "../requests/userAccess"
import { UserDbAccess } from '../dbaccess/userDbAccess'
import { UserUpdateRequest } from '../requests/updateUserRequest'
import * as uuid from 'uuid'
// Instances
const userDbAccess = new UserDbAccess()

export async function createUser(userAccessReqBody: UserAccess, oauthUId: string): Promise<uuid> {
    if (userAccessReqBody == null) {
        throw new Error('The request body is null')
    }
    if (userAccessReqBody.firstName == undefined 
        || userAccessReqBody.lastName == undefined ) {
        throw new Error('Missing body field')
    }
    var userId : uuid
    try {        
        userId = await userDbAccess.checkIfUsersExistsByOAuthID(oauthUId)
    } catch (err) {
        throw err
    }
    if (userId != null) {
        return userId
    } 
    // If the user does not exist in database
    try {
        userId = await userDbAccess.AddUser(userAccessReqBody, oauthUId)
        return userId
    } catch (err) {
        throw err
    }
}

export async function UpdateUser(userUpdateReqBody: UserUpdateRequest, oauthUId: string) {
    if (userUpdateReqBody == null) {
        throw new Error('The request body is null')
    }
    if (userUpdateReqBody.firstName == undefined
        || userUpdateReqBody.lastName == undefined
        || userUpdateReqBody.company == undefined
        || userUpdateReqBody.title == undefined
        || userUpdateReqBody.namecardUrl == undefined
        || userUpdateReqBody.profileUrl == undefined) {
            throw new Error('Missing body field')
    }
    var userId : uuid
    try {        
        userId = await userDbAccess.checkIfUsersExistsByOAuthID(oauthUId)
        if (userId == null) {
            throw new Error('Unauthorized request')
        }
    } catch (err) {
        throw err
    }
    // Update the user now
    try {
        await userDbAccess.UpdateUser(userUpdateReqBody, userId)
    } catch (err) {
        throw err
    }
}

export async function getUserDetails(isNonUser: boolean, userId: string): Promise<UserAccess> {
    return userDbAccess.getUserDetails(isNonUser, userId)
}