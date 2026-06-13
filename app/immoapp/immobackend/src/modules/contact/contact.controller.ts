import { Controller, Post, Param, Body, Get, Query } from '@nestjs/common'
import { ContactService } from './contact.service'
import { ContactDto } from './dto/contact.dto'
import { Public } from '@/core/decorators/public.decorator'
import { Roles } from '@/core/decorators/roles.decorator'

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  submit(@Body() dto: ContactDto) {
    return this.contactService.submit(dto)
  }

  @Public()
  @Post('property/:id')
  contactAgent(@Param('id') id: string, @Body() dto: ContactDto) {
    return this.contactService.submit(dto, id)
  }

  @Roles("staff")
  @Get()
  getContact(@Query('limit') limit: number, @Query("page") page: number){
    if(!page || page <1) page = 1;
    if(!limit || limit < 1) limit = 1;
    if(limit > 50) limit = 50;
    return this.contactService.getAll(limit, page)
  }

}
