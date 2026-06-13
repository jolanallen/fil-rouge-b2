import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { PropertyService } from '../services/property.service'
import { AgencyService } from '../services/agency.service'
import { PropertySearchDto } from '../dto/property-search.dto'
import { CreatePropertyDto } from '../dto/create-property.dto'
import { UpdatePropertyDto } from '../dto/update-property.dto'
import { UpdatePropertyStatusDto } from '../dto/update-property-status.dto'
import { AssignAgentDto } from '../dto/assign-agent.dto'
import { SendMessageDto } from '../dto/send-message.dto'
import { Public } from '@/core/decorators/public.decorator'
import { OptionalAuth } from '@/core/decorators/optional-auth.decorator'
import { Roles } from '@/core/decorators/roles.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'
import { JwtAuthGuard } from '@/core/guards/jwt-auth.guard'
import { OptionalJwtAuthGuard } from '@/core/guards/optional-jwt-auth.guard'
import { UseGuards } from '@nestjs/common'

@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly agencyService: AgencyService,
  ) {}

  @OptionalAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('agencies')
  listAgencies() {
    return this.agencyService.findAll()
  }

  @OptionalAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(@Query() dto: PropertySearchDto, @CurrentUser('id') userId?: string) {
    return this.propertyService.findAll(dto, userId)
  }

  @Post('request')
  request(@Body() dto: CreatePropertyDto, @CurrentUser('id') userId: string) {
    return this.propertyService.createRequest(dto, userId)
  }

  @Get('my-requests')
  myRequests(@CurrentUser('id') userId: string) {
    return this.propertyService.findByOwner(userId)
  }

  @Roles('staff')
  @Get('staff')
  findAllStaff(@Query() dto: PropertySearchDto) {
    return this.propertyService.findAllStaff(dto)
  }

  @Roles('staff')
  @Get('stats')
  getStats() {
    return this.propertyService.getStats()
  }

  @Roles('staff')
  @Post()
  create(@Body() dto: CreatePropertyDto, @CurrentUser('id') userId: string) {
    return this.propertyService.create(dto, userId)
  }

  @Roles('staff')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertyService.update(id, dto)
  }

  @Roles('staff')
  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyStatusDto,
    @CurrentUser('id') staffId: string,
  ) {
    return this.propertyService.updateStatus(id, dto, staffId)
  }

  @Roles('staff')
  @Put(':id/assign')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignAgentDto,
    @CurrentUser('id') staffId: string,
  ) {
    return this.propertyService.assignAgent(id, staffId, dto.agentId)
  }

  @Roles('staff')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.propertyService.delete(id)
  }

  @OptionalAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser('id') userId?: string) {
    return this.propertyService.findById(id, userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/manage')
  findByIdForManage(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.propertyService.findByIdForManage(id, user.id, user.role)
  }

  @Public()
  @Get(':id/similar')
  findSimilar(@Param('id') id: string) {
    return this.propertyService.findSimilar(id)
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.propertyService.uploadImage(id, userId, userRole, file)
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/images/:imageId')
  deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.propertyService.deleteImage(id, imageId, userId, userRole)
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('firstName') firstName: string,
    @CurrentUser('lastName') lastName: string,
    @CurrentUser('role') userRole: string,
  ) {
    const senderName = dto.senderName || `${firstName} ${lastName}`.trim() || 'User'
    return this.propertyService.sendMessage(id, dto, userId, senderName, userRole)
  }

  @Get(':id/messages')
  getMessages(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.propertyService.getMessages(id, userId, userRole)
  }

  @Get(':id/history')
  getHistory(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.propertyService.getHistory(id, userId, userRole)
  }
}
