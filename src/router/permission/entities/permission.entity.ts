import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'permissions',
})
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    comment: '权限代码',
    unique: true,
  })
  code: string;

  @Column({
    length: 100,
    comment: '权限描述',
  })
  desc: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
