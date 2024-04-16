import {Entity, hasMany, model, property} from '@loopback/repository';
import {Role, RoleRelations} from './role.model';

@model({
  name: "user"
})
export class User extends Entity {
  @property({
    id: true,
    type: 'number'
  })
  id: number;

  @property({
    required: true,
    type: 'string'
  })
  email: string;

  @property({
    type: 'string',
    name: 'cognito_id'
  })
  cognitoId: string;

  @property({
    type: 'string',
    name: 'first_name',
    required: true
  })
  firstName: string;

  @property({
    type: 'string',
    name: 'last_name'
  })
  lastName: string;

  @property({
    type: 'number',
    name: 'company_id',
    hidden: true
  })
  companyId: number;

  @property({
    type: 'Date'
  })
  created: string;

  @property({
    type: 'Date'
  })
  updated: string;

  @hasMany(() => Role, {
    through: {
      model: () => UserRole,
      keyFrom: 'userId',
      keyTo: 'roleId'
    }
  })
  roles: Role[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  roles?: RoleRelations;
}

export type UserWithRelations = User & UserRelations;

@model({
  name: 'user_role'
})
export class UserRole extends Entity {
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
    name: 'user_id'
  })
  userId: number;
}
