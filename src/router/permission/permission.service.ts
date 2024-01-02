import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { FindPermissionDto } from './dto/find-permission.dto';
import { FindPermissionListVo } from './vo/find-permission.vo';
import { Permission } from './entities/permission.entity';
@Injectable()
export class PermissionService {
  // 注入 Role 实体，
  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  async create(createRoleDto: CreatePermissionDto) {
    return await this.permissionRepository.save(createRoleDto);
  }

  async findPermissions(role: FindPermissionDto) {
    const { code, desc, pageSize = 20 } = role;

    const condition: Record<string, any> = {};

    if (code) {
      condition.code = Like(`%${code}%`);
    }
    if (desc) {
      condition.desc = Like(`%${desc}%`);
    }

    const [roles, totalCount] = await this.permissionRepository.findAndCount({
      select: ['id', 'desc', 'code', 'createTime', 'updateTime'],
      where: condition,
      skip: (role.pageNo - 1) * pageSize,
      take: pageSize,
    });

    const vo = new FindPermissionListVo();
    vo.list = roles;
    vo.totalCount = totalCount;
    vo.pageNo = role.pageNo;
    vo.pageSize = pageSize;

    return vo;
  }

  async findOneById(id: number) {
    return await this.permissionRepository.findOneBy({
      id,
    });
  }

  async findOneByName(code: string) {
    return await this.permissionRepository.findOneBy({
      code,
    });
  }

  async update(updateRoleDto: UpdatePermissionDto) {
    return await this.permissionRepository.update(
      { id: updateRoleDto.id },
      updateRoleDto,
    );
  }

  async remove(id: number) {
    return await this.permissionRepository.delete({ id });
  }
}
