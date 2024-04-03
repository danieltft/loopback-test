import {intercept} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef} from '@loopback/rest';
import {TransactionInterceptor} from '../interceptors/transaction.interceptor';
import {Company} from '../models/company.model';
import {CompanyRepository} from '../repositories/company.repository';

@intercept(TransactionInterceptor)
export class CompanyController {
  constructor(
    @repository(CompanyRepository) public repository: CompanyRepository
  ) { }

  @intercept('auth')
  @get('/company', {
    responses: {
      '200': {
        description: 'Array of Companies',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Company, {includeRelations: true})
            },
          },
        },
      },
    },
  })
  async get(): Promise<Company[]> {
    const result = await this.repository.find({
      include: ['users']
    });
    return result;
  }
}
