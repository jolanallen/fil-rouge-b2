import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Agency } from '../entities/agency.entity'

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency)
    private readonly agencyRepo: Repository<Agency>,
  ) {}

  async findAll() {
    return this.agencyRepo.find()
  }

  async findClosest(department: string, latitude?: number | null, longitude?: number | null): Promise<Agency | null> {
    const agencies = await this.agencyRepo.find({ where: { department } })

    if (agencies.length > 0) {
      return agencies[0]
    }

    const all = await this.agencyRepo.find()

    if (latitude != null && longitude != null) {
      let closest: Agency | null = null
      let minDist = Infinity
      for (const a of all) {
        if (a.latitude == null || a.longitude == null) continue
        const dist = Math.sqrt(
          (a.latitude - latitude) ** 2 + (a.longitude - longitude) ** 2,
        )
        if (dist < minDist) {
          minDist = dist
          closest = a
        }
      }
      return closest
    }

    return all.length > 0 ? all[0] : null
  }
}
