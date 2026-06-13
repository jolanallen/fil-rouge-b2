import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { IUserRepository } from './user-repository.interface'

@Injectable()
export class TypeormUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email })
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user)
  }
}
