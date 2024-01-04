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
  Inject,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindRoleDto } from './dto/find-role.dto';
import { RequireLogin } from '../../common/decorator/custom.decorator';
import { PermissionService } from '../permission/permission.service';
import { Role } from './entities/role.entity';
@Controller('role')
@RequireLogin()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Inject(PermissionService)
  permissionService: PermissionService;

  @Post('add')
  async create(@Body() createRoleDto: CreateRoleDto, @Req() req: any) {
    const { permissionIds } = createRoleDto;
    createRoleDto.opUser = req?.user?.username;
    const _role = await this.roleService.findOneByName(createRoleDto.name);
    if (_role) {
      throw new BadRequestException('角色名已存在');
    }
    const permissionsInfo = await this.permissionService.findAllPermissions(
      permissionIds,
    );

    const role = new Role();
    role.name = createRoleDto.name;
    role.desc = createRoleDto.desc;
    role.permissions = permissionsInfo.list;

    try {
      await this.roleService.create(role);
      return '角色添加成功';
    } catch (e) {
      throw new BadRequestException('角色添加失败' + e.message);
    }
  }

  @Get('list')
  async findList(@Query() query: FindRoleDto) {
    try {
      const data = await this.roleService.findRoles(query);
      return data;
    } catch (error) {
      console.log(error);
      return { code: 400, data: null, message: '查询失败' };
    }
  }

  @Get('getAll')
  async findAll() {
    try {
      const data = await this.roleService.findAllRoles();
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
    const { permissionIds = [] } = updateRoleDto;
    const permissionsInfo = await this.permissionService.findAllPermissions(
      permissionIds,
    );
    const role = new Role();
    role.id = updateRoleDto.id;
    role.name = updateRoleDto.name;
    role.desc = updateRoleDto.desc;
    role.permissions = permissionsInfo.list;

    try {
      await this.roleService.update(role);
      return '更新成功';
    } catch (error) {
      throw new BadRequestException('更新失败' + error?.message);
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
