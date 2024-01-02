import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';

@Entity({
  name: 'roles',
})
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    comment: '角色名',
    unique: true,
    nullable: true,
  })
  name: string;

  @Column({
    length: 50,
    comment: '角色描述',
  })
  desc: string;

  @Column({
    length: 20,
    comment: '操作人员',
    nullable: true,
  })
  opUser: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({
    comment: '状态',
    default: 0,
  })
  status: number;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
  })
  permissions: Permission[];
}
