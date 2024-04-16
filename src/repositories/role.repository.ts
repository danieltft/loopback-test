import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyThroughRepositoryFactory, juggler, repository} from '@loopback/repository';
import {Permission} from '../models/permission.model';
import {Role, RolePermission, RoleRelations} from '../models/role.model';
import {PermissionRepository} from './permission.repository';

export class RoleRepository extends DefaultCrudRepository<
  Role,
  typeof Role.prototype.id,
  RoleRelations
> {

  public readonly permissions: HasManyThroughRepositoryFactory<
    Permission,
    typeof Permission.prototype.id,
    RolePermission,
    typeof Role.prototype.id
  >

  constructor(
    @inject('datasources.mysql') dataSource: juggler.DataSource,
    @repository.getter('PermissionRepository')
    protected permissionRepositoryGetter: Getter<PermissionRepository>,
    @repository.getter('RolePermissionRepository')
    protected rolePermissionRepositoryGetter: Getter<RolePermissionRepository>
  ) {
    super(Role, dataSource);
    this.permissions = this.createHasManyThroughRepositoryFactoryFor(
      'permissions',
      permissionRepositoryGetter,
      rolePermissionRepositoryGetter
    );
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
  }
}

export class RolePermissionRepository extends DefaultCrudRepository<
  RolePermission,
  typeof RolePermission.prototype.id
> {
  constructor(
    @inject('datasources.mysql') dataSource: juggler.DataSource
  ) {
    super(RolePermission, dataSource);
  }
}
