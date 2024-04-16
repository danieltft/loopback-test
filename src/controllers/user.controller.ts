import {intercept} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {get, getModelSchemaRef, post, requestBody} from '@loopback/rest';
import HttpError, {STATUS_CONFLICT} from '../common/http';
import {TransactionInterceptor} from '../interceptors/transaction.interceptor';
import {User} from '../models/user.model';
import {CompanyRepository} from '../repositories/company.repository';
import {UserRepository} from '../repositories/user.repository';
import {CognitoService} from '../services/cognito.service';

@model({
  name: "credentials"
})
class Credentials {
  @property({
    required: true,
    type: 'string'
  })
  email: string;
  @property({
    required: true,
    type: 'string'
  })
  password: string;
}

@model({
  name: "createUser"
})
class CreateUser {
  @property({
    required: true,
    type: 'string'
  })
  firstName: string;
  @property({
    type: 'string'
  })
  lastName: string;
  @property({
    required: true,
    type: 'string'
  })
  company: string;
  @property({
    required: true,
    type: 'string'
  })
  email: string;
  @property({
    required: true,
    type: 'string'
  })
  password: string;
}

@intercept(TransactionInterceptor)
export class UserController {

  constructor(
    @repository(UserRepository) public repository: UserRepository,
    @repository(CompanyRepository) public companyRepository: CompanyRepository
  ) { }

  @post('/signup', {
    responses: {
      '200': {
        description: 'User created',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(CreateUser)
        },
      },
    })
    request: CreateUser
  ): Promise<User> {
    const existentCompany = await this.companyRepository.count({name: request.company});

    if (existentCompany.count > 0) {
      throw new HttpError(
        `company already exists`,
        STATUS_CONFLICT
      )
    }

    const company = await this.companyRepository.create({name: request.company});

    const user = await this.repository.create({
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      companyId: company.id
    });
    const authService = new CognitoService();
    try {
      await authService.signUp(
        user,
        request.password,
        this.repository
      );
    } catch (err: any) {
      console.log('error calling auth service');
      console.log(err);
      throw new HttpError(
        err.message,
        STATUS_CONFLICT
      )
    }
    return user;
  }

  @post('/login', {
    responses: {
      '200': {
        description: 'User login',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credentials)
        },
      },
    })
    credentials: Credentials
  ): Promise<any> {
    const service = new CognitoService();
    const result = await service.authenticate(
      credentials.email,
      credentials.password
    );
    return result;
  }

  @intercept('auth')
  @get('/users', {
    responses: {
      '200': {
        description: 'Array of Companies',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User)
            },
          },
        },
      },
    },
  })
  async get(): Promise<User[]> {
    const result = await this.repository.find({
      include: [{
        relation: 'roles',
        scope: {
          include: ['permissions']
        }
      }]
    });
    return result;
  }
}
