import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyThroughRepositoryFactory, juggler, repository} from '@loopback/repository';
import {Role} from '../models/role.model';
import {User, UserRelations, UserRole} from '../models/user.model';
import {RoleRepository} from './role.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly roles: HasManyThroughRepositoryFactory<
    Role,
    typeof Role.prototype.id,
    UserRole,
    typeof User.prototype.id
  >

  constructor(
    @inject('datasources.mysql') dataSource: juggler.DataSource,
    @repository.getter('RoleRepository')
    protected roleRepositoryGetter: Getter<RoleRepository>,
    @repository.getter('UserRoleRepository')
    protected userRoleRepositoryGetter: Getter<UserRoleRepository>
  ) {
    super(User, dataSource);
    this.roles = this.createHasManyThroughRepositoryFactoryFor(
      'roles',
      roleRepositoryGetter,
      userRoleRepositoryGetter
    );
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
  }
}

export class UserRoleRepository extends DefaultCrudRepository<
  UserRole,
  typeof UserRole.prototype.id
> {
  constructor(
    @inject('datasources.mysql') dataSource: juggler.DataSource
  ) {
    super(UserRole, dataSource);
  }
}
