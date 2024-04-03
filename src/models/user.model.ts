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
