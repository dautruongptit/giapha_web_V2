export type FeedbackType = 'wrong' | 'missing' | 'other'
export type FeedbackStatus = 'pending' | 'accepted' | 'rejected'

export type Feedback = {
  id: string
  memberId: string
  type: FeedbackType
  content: string
  image?: string
  status: FeedbackStatus
  reply: string
  author: string
  createdAt: string
}
