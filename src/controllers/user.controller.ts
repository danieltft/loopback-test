import {intercept} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, post, requestBody} from '@loopback/rest';
import HttpError, {STATUS_CONFLICT} from '../common/http';
import {TransactionInterceptor} from '../interceptors/transaction.interceptor';
import {User} from '../models/user.model';
import {CompanyRepository} from '../repositories/company.repository';
import {UserRepository} from '../repositories/user.repository';
import {CognitoService} from '../services/cognito.service';

class Credentials {
  email: string;
  password: string;
}

class CreateUser extends Credentials {
  firstName: string;
  lastName: string;
  company: string;
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
      content: {
        'application/json': {
          schema: getModelSchemaRef(CreateUser)
        },
      },
    })
    request: CreateUser
  ): Promise<User> {
    console.log('creating user');
    const company = await this.companyRepository.create({name: request.company});

    const user = await this.repository.create({
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      companyId: company.id
    });
    console.log('user created in database');
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
    const result = await this.repository.find();
    return result;
  }
}
