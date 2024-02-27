import {Entity, hasMany, model, property} from '@loopback/repository';
import {User, UserWithRelations} from './user.model';

@model({
  name: "company"
})
export class Company extends Entity {
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

  @hasMany(() => User)
  users: User[];

  @property({
    type: 'Date'
  })
  created: string;

  @property({
    type: 'Date'
  })
  updated: string;

  constructor(data?: Partial<Company>) {
    super(data);
  }
}

export interface CompanyRelations {
  users?: UserWithRelations;
}

export type CompanyWithRelations = Company & CompanyRelations;
