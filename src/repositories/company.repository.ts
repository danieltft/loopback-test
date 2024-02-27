import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import {Company, CompanyRelations} from '../models/company.model';
import {User} from '../models/user.model';
import {UserRepository} from './user.repository';

export class CompanyRepository extends DefaultCrudRepository<
  Company,
  typeof Company.prototype.id,
  CompanyRelations
> {

  public readonly users: HasManyRepositoryFactory<
    User,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.mysql') dataSource: juggler.DataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>
  ) {
    super(Company, dataSource);
    this.users = this.createHasManyRepositoryFactoryFor(
      'users',
      userRepositoryGetter
    );
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}
