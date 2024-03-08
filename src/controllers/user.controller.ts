import {intercept} from '@loopback/core';
import {repository} from '@loopback/repository';
import {getModelSchemaRef, post, requestBody} from '@loopback/rest';
import HttpError, {STATUS_CONFLICT} from '../common/http';
import {TransactionInterceptor} from '../interceptors/transaction.interceptor';
import {User} from '../models/user.model';
import {UserRepository} from '../repositories/user.repository';
import {CognitoService} from '../services/cognito.service';

class Credentials {
  email: string;
  password: string;
}

@intercept(TransactionInterceptor)
export class UserController {

  constructor(
    @repository(UserRepository) public repository: UserRepository
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
          schema: getModelSchemaRef(Credentials)
        },
      },
    })
    credentials: Credentials
  ): Promise<User> {
    const user = await this.repository.create({
      email: credentials.email,
      companyId: 1
    });
    const authService = new CognitoService();
    try {
      await authService.signUp(
        user,
        credentials.password,
        this.repository
      );
    } catch (err: any) {
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
}
