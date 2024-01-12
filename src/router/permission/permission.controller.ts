import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { FindPermissionDto } from './dto/find-permission.dto';
import { RequireLogin } from '../../common/decorator/custom.decorator';

@Controller('permission')
@RequireLogin()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('add')
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
    @Req() req: any,
  ) {
    createPermissionDto.opUser = req?.user?.username;
    const _Permission = await this.permissionService.findOneByName(
      createPermissionDto.code,
    );
    if (_Permission) {
      return '权限已存在';
    }

    try {
      await this.permissionService.create(createPermissionDto);
      return '权限添加成功';
    } catch (e) {
      throw new BadRequestException('权限添加失败');
    }
  }

  @Get('list')
  async findRoleList(@Query() query: FindPermissionDto) {
    try {
      return await this.permissionService.findPermissions(query);
    } catch (error) {
      console.log(error);
      return { code: 400, data: null, message: '查询失败' };
    }
  }

  @Get('getAll')
  async findAll() {
    try {
      const data = await this.permissionService.findAllPermissions();
      return data;
    } catch (error) {
      console.log(error);
      return { code: 400, data: null, message: '查询失败' };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOneById(+id);
  }

  @Post(':id')
  async update(@Body() updatePermissionDto: UpdatePermissionDto) {
    try {
      await this.permissionService.update(updatePermissionDto);
      return '更新成功';
    } catch (error) {
      return '更新失败';
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }
}
