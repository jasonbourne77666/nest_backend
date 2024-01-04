import { Injectable } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindRoleDto } from './dto/find-role.dto';
import { FindRoleListVo } from './vo/find-role.vo';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  // 注入 Role 实体，
  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  async create(createRoleDto: Role) {
    return await this.roleRepository.save(createRoleDto);
  }

  async findRoles(role: FindRoleDto) {
    const { name, status, pageSize = 20, pageNo } = role;

    const condition: Record<string, any> = {};

    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (status) {
      condition.status = Like(`%${status}%`);
    }

    const [roles, totalCount] = await this.roleRepository.findAndCount({
      select: ['id', 'desc', 'name', 'status', 'createTime', 'updateTime'],
      where: condition,
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      relations: ['permissions'],
    });

    const vo = new FindRoleListVo();
    vo.list = roles;
    vo.totalCount = totalCount;
    vo.pageNo = pageNo;
    vo.pageSize = pageSize;
    return vo;
  }

  async findAllRoles() {
    const list = await this.roleRepository.find({
      relations: ['permissions'],
    });
    const vo = new FindRoleListVo();
    vo.list = list;
    return vo;
  }

  async findOneById(id: number) {
    return await this.roleRepository.findOneBy({
      id,
    });
  }

  async findOneByName(name: string) {
    return await this.roleRepository.findOneBy({
      name,
    });
  }

  async update(updateRoleDto: Role) {
    return await this.roleRepository.save(updateRoleDto);
  }

  async remove(id: number) {
    return await this.roleRepository.delete({
      id,
    });
  }
}
