import {Entity, hasMany, model, property} from '@loopback/repository';
import {Permission, PermissionRelations} from './permission.model';

@model({
  name: "role"
})
export class Role extends Entity {
  @property({
    id: true,
    type: 'number'
  })
  id: number;

  @property({
    required: true,
    type: 'string'
  })
  name: string;

  @property({
    type: 'number',
    name: 'company_id'
  })
  companyId: number;

  @hasMany(() => Permission, {
    through: {
      model: () => RolePermission,
      keyFrom: 'roleId',
      keyTo: 'permissionId'
    }
  })
  permissions: Permission[];

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  permissions?: PermissionRelations;
}

export type RoleWithRelations = Role & RoleRelations;

@model({
  name: 'role_permission'
})
export class RolePermission extends Entity {
  @property({
    id: true,
    type: 'number'
  })
  id: number;

  @property({
    type: 'number',
    name: 'role_id'
  })
  roleId: number;

  @property({
    type: 'number',
    name: 'permission_id'
  })
  permissionId: number;
}
