import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {Transaction, model, property, repository} from '@loopback/repository';
import {get, getModelSchemaRef, post, requestBody} from '@loopback/rest';
import HttpError, {STATUS_CONFLICT} from '../common/http';
import {User} from '../models/user.model';
import {CompanyRepository} from '../repositories/company.repository';
import {RolePermissionRepository, RoleRepository} from '../repositories/role.repository';
import {UserRepository, UserRoleRepository} from '../repositories/user.repository';
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

export class UserController {

  constructor(
    @repository(UserRepository) public repository: UserRepository,
    @repository(CompanyRepository) public companyRepository: CompanyRepository,
    @repository(RoleRepository) public roleRepository: RoleRepository,
    @repository(UserRoleRepository) public userRoleRepository: UserRoleRepository,
    @repository(RolePermissionRepository) public rolePermissionRepository: RolePermissionRepository
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
    request: CreateUser,
    @inject('transaction') tx: Transaction
  ): Promise<User> {
    const existentCompany = await this.companyRepository.count({name: request.company});

    if (existentCompany.count > 0) {
      throw new HttpError(
        `company already exists`,
        STATUS_CONFLICT
      )
    }

    const company = await this.companyRepository.create(
      {name: request.company},
      {transaction: tx}
    );

    const user = await this.repository.create({
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      companyId: company.id
    }, {transaction: tx});

    const templateCompany = await this.companyRepository.findOne({where: {name: 'Template'}});
    if (templateCompany === null) {
      throw new HttpError(
        `template not found`,
        STATUS_CONFLICT
      )
    }

    const templateRoles = await this.roleRepository.find({
      where: {companyId: templateCompany.id},
      include: ['permissions']
    });

    await Promise.all(templateRoles.map(async (role) => {
      const newRole = await this.roleRepository.create({
        name: role.name,
        companyId: company.id
      }, {transaction: tx});

      console.log('new role', newRole);
      console.log('permissions of role', role.permissions);

      if (role.permissions !== undefined && role.permissions.length > 0) {

        await Promise.all(role.permissions.map(async (permission) => {
          await this.rolePermissionRepository.create({
            roleId: newRole.id,
            permissionId: permission.id
          }, {transaction: tx});
        }));
      }

      await this.userRoleRepository.create({
        userId: user.id,
        roleId: newRole.id
      }, {transaction: tx});
    }));

    const authService = new CognitoService();
    try {
      await authService.signUp(
        user,
        request.password,
        this.repository,
        tx as any
      );
    } catch (err: any) {
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

  @authorize({
    resource: 'getUsers'
  })
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
  async get(
    @inject('currentUser') currentUser: User
  ): Promise<User[]> {
    const result = await this.repository.find({
      where: {companyId: currentUser.companyId},
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
