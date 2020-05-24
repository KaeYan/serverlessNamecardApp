import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')
const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJXTzq2wWEUhFIMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi16NTRpdGRtYy5hdXRoMC5jb20wHhcNMjAwMTI4MTQ1OTA1WhcNMzMx
MDA2MTQ1OTA1WjAhMR8wHQYDVQQDExZkZXYtejU0aXRkbWMuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqNcljmaODZ5Dhbk1QCkGsYMA
+XyU101ekZKEX8Ww1Y9DTASdzpWpDUdp+0ZEwTvwdvTdeqF5sWzq44g6Fx8GRbzt
G3qbYVJ6haUkucShUU3GSn83frge57OKfq8Q4BaCvAMK9KnD4FUu62N/0TzcwsDA
OH80cVzMSN7yhCYxf3T89LbqCAPTTw7tboygbKncMftLzVa6+upMzgSZ1UG2ZPfq
jxc0duy3atduA6J6pSjx4KLIlX3Iz6r1zxLvnLOmuxLTKdP87UjZlG9IPPohUkEv
j4Rv/nhf8MEoHBmDm4sSAViwQ4gUgcR1FCMrIKqRudjJUaLy3lpaEIUivxhalwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQoRXciezMIqWBk2UIh
LCPSN0H9djAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBABx+e9R1
4lwroSxpwTmO3SvyuMssB/QAN9/ytKiucAEq4MCUhi8zzEXGaYiqE6F9EH7VfzTb
MYrbF0fPKj8ZyhWbmUaiI0aTNlbo3Xdul4cEbjWni8O4KCiwPu3xWc25cBmUThjk
gN/vebvqP7rZqwqdS7y240emPp4rQEKDYxr7UmJcJNXSBjafgB4CAn6GiR79xt+0
YLLbh7lHuBTy6Sa8YLXCArk2WjoEMEx5pLCSN98MMqX/2lc9i9r8xWH5Qpp9LXo2
pZYiALNVe3e3JmuRq5hS0GrQHE/wTNafcJxExn7Dl31h5x/tmJxm14WmOZxIbU9g
5c65BTXL9OM8VdQ=
-----END CERTIFICATE-----
`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken)
    try {
        const jwtToken = await verifyToken(event.authorizationToken)
        logger.info('User was authorized', jwtToken)
        return {  
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        logger.error('User not authorized', { error: e.message })
        return {
            principalId: 'invalid user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
    const token = getToken(authHeader)
    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')
  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')
  const split = authHeader.split(' ')
  const token = split[1]
  return token
}
