import {Entity, model, property} from '@loopback/repository';

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
    type: 'string'
  })
  password: string;

  @property({
    type: 'number',
    name: 'company_id'
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

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {

}

export type UserWithRelations = User & UserRelations;
