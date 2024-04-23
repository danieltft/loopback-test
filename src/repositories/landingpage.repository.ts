import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {LandingPage, LandingPageRelations} from '../models/landingpage.model';


export class LandingPageRepository extends DefaultCrudRepository<
  LandingPage,
  typeof LandingPage.prototype.id,
  LandingPageRelations
> {

  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource
  ) {
    super(LandingPage, dataSource);
  }
}
