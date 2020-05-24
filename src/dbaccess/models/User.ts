// User model to be stored in database
export interface User {
  userId: string   // An id that is used within the namecard app (separated from google/twitter/facebook id)
  oauthId: string  // An id that is given from google/twitter/facebook etc.
  firstName: string
  lastName: string
  company: string
  title: string
  namecardUrl?: string
  createdAt: string
  updatedAt: string
  deletedAt: string
}
  