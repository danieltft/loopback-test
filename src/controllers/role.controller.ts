import {repository} from '@loopback/repository';
import {get, getModelSchemaRef} from '@loopback/rest';
import {Role} from '../models/role.model';
import {RoleRepository} from '../repositories/role.repository';

export class RoleController {

  constructor(
    @repository(RoleRepository) public repository: RoleRepository
  ) { }

  @get('/roles', {
    responses: {
      '200': {
        description: 'Array of roles',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Role)
            },
          },
        },
      },
    },
  })
  async get(): Promise<Role[]> {
    const result = await this.repository.find({
      include: ['permissions']
    });
    return result;
  }
}
