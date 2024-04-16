import {inject} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Permission, PermissionRelations} from '../models/permission.model';

export class PermissionRepository extends DefaultCrudRepository<
  Permission,
  typeof Permission.prototype.id,
  PermissionRelations
> {

  constructor(
    @inject('datasources.mysql') dataSource: juggler.DataSource
  ) {
    super(Permission, dataSource);
  }
}
