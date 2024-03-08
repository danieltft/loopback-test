import {intercept} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, post, requestBody} from '@loopback/rest';
import {TransactionInterceptor} from '../interceptors/transaction.interceptor';
import {Company} from '../models/company.model';
import {CompanyRepository} from '../repositories/company.repository';

@intercept(TransactionInterceptor)
export class CompanyController {
  constructor(
    @repository(CompanyRepository) public repository: CompanyRepository
  ) { }

  @post('/company', {
    responses: {
      '200': {
        description: 'Company',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': Company,
            },
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Company, {
            title: 'NewCompany',
            exclude: ['id'],
          }),
        },
      },
    })
    newCompany: Omit<Company, 'id' | 'created' | 'updated'>
  ): Promise<Company> {
    return this.repository.create(newCompany);
  }

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
