import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindRoleDto } from './dto/find-role.dto';
import { RequireLogin } from '../../common/decorator/custom.decorator';

@Controller('role')
@RequireLogin()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('add')
  async create(@Body() createRoleDto: CreateRoleDto, @Req() req: any) {
    createRoleDto.opUser = req?.user?.username;
    const _role = await this.roleService.findOneByName(createRoleDto.name);
    if (_role) {
      throw new BadRequestException('角色名已存在');
    }

    try {
      await this.roleService.create(createRoleDto);
      return '角色添加成功';
    } catch (e) {
      throw new BadRequestException('角色添加失败' + e.message);
    }
  }

  @Get('list')
  async findAll(@Query() query: FindRoleDto) {
    try {
      const data = await this.roleService.findRoles(query);
      return data;
    } catch (error) {
      console.log(error);
      return { code: 400, data: null, message: '查询失败' };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOneById(+id);
  }

  @Post('update')
  async update(@Body() updateRoleDto: UpdateRoleDto) {
    try {
      await this.roleService.update(updateRoleDto);
      return '更新成功';
    } catch (error) {
      return '更新失败';
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const res = await this.roleService.remove(+id);
      console.log(res);

      return '删除成功';
    } catch (error) {
      return '删除失败';
    }
  }
}
