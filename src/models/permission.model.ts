import {Entity, model, property} from '@loopback/repository';

@model({
  name: "permission"
})
export class Permission extends Entity {
  @property({
    id: true,
    type: 'number'
  })
  id: number;

  @property({
    type: 'string'
  })
  name: string;

  constructor(data?: Partial<Permission>) {
    super(data);
  }
}

export interface PermissionRelations {

}

export type PermissionWithRelations = Permission & PermissionRelations;
