import { User } from '../entities/user.entity'

type UserPresentation = Pick<
  User,
  'id' | 'email' | 'firstName' | 'lastName' | 'phone' | 'role' | 'avatar' | 'createdAt' | 'updatedAt'
>

export function presentUser(user: User): UserPresentation {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
