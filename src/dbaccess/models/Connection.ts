// Connection model to be stored in database
export interface Connection {
  userId: string   // An id that is used within the namecard app (separated from google/twitter/facebook id)
  connectionId: string
  firstName: string
  lastName: string
  company: string
  title: string
  namecardUrl?: string
  createdAt: string
}
