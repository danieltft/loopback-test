import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {del, get, getModelSchemaRef, param, patch, post, requestBody} from '@loopback/rest';
import HttpError, {STATUS_FORBIDDEN, STATUS_NOT_FOUND} from '../common/http';
import getLandingPageUniqueName from '../common/utils';
import {validateColor, validateUrl} from '../common/validations';
import {LandingPage} from '../models/landingpage.model';
import {User} from '../models/user.model';
import {LandingPageRepository} from '../repositories/landingpage.repository';
import {AIService} from '../services/ai.service';

type PostRequest =
  Omit<LandingPage, "title" | "content" | "id" | "companyId" | "uniqueName">

type PatchRequest =
  Omit<LandingPage, "titlePrompt" | "contentPrompt" | "id" | "companyId" | "uniqueName">

type LandingPageRequest = PostRequest | PatchRequest;

@authorize({})
export class LandingPageController {

  constructor(
    @repository(LandingPageRepository) public repository: LandingPageRepository
  ) { }

  hasPermissionForResource(
    landingPage: LandingPage,
    user: User
  ): void {
    if (landingPage.companyId !== user.companyId) {
      throw new HttpError(
        `can't perform request on the resource`,
        STATUS_FORBIDDEN
      );
    }
  }

  async findLandingPage(
    id: number,
    user: User
  ): Promise<LandingPage> {
    const landingPage = await this.repository.findOne({
      where: {id}
    });

    if (landingPage === null) {
      throw new HttpError(
        `landing page not found`,
        STATUS_NOT_FOUND
      );
    }

    this.hasPermissionForResource(landingPage, user);

    return landingPage;
  }

  validateInput(
    input: LandingPageRequest
  ): void {
    validateColor(input.color, 'color');
    validateUrl(input.video, 'video');
    return;
  }

  /* --------------------------------------  */

  @get('/landingpage', {
    responses: {
      '200': {
        description: 'Get landing pages',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': LandingPage,
            },
          },
        },
      },
    },
  })
  async get(
    @inject('currentUser') currentUser: User
  ): Promise<any> {
    return await this.repository.find({
      where: {companyId: currentUser.companyId}
    })
  }

  /* --------------------------------------  */

  @get('/landingpage/{id}', {
    responses: {
      '200': {
        description: 'Get landing page by id',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': LandingPage,
            },
          },
        },
      },
    },
  })
  async getById(
    @param.path.number('id') id: number,
    @inject('currentUser') currentUser: User
  ) {
    const result = await this.repository.findOne({
      where: {
        id,
        companyId: currentUser.companyId
      }
    });

    if (result === null) {
      throw new HttpError(
        `landing page not found`,
        STATUS_NOT_FOUND
      )
    }

    return result;
  }

  /* --------------------------------------  */

  @get('/landingpage/{uniqueName}', {
    responses: {
      '200': {
        description: 'Get landing page by uniqueName',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': LandingPage,
            },
          },
        },
      },
    },
  })
  async getByUniqueName(
    @param.path.string('uniqueName') uniqueName: string,
    @inject('currentUser') currentUser: User
  ): Promise<LandingPage> {
    const result = await this.repository.findOne({
      where: {
        uniqueName,
        companyId: currentUser.companyId
      }
    });

    if (result === null) {
      throw new HttpError(
        `landing page not found`,
        STATUS_NOT_FOUND
      )
    }

    return result;
  }

  /* --------------------------------------  */

  @post('/landingpage', {
    responses: {
      '200': {
        description: 'Create landing page',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': LandingPage,
            },
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(LandingPage, {
            title: 'PostLandingPageRequest',
            exclude: ['title', 'content', 'id', 'companyId', 'uniqueName']
          })

        },
      },
    })
    request: PostRequest,
    @inject('currentUser') currentUser: User
  ): Promise<LandingPage> {
    // Validate request
    this.validateInput(request);

    // Generate prompts for the generated landing page
    const aiservice = new AIService();
    const title = await aiservice.generateTitle(
      request.titlePrompt
    );
    const content = await aiservice.generateContent(
      request.contentPrompt
    );

    const uniqueName = await getLandingPageUniqueName(
      this.repository,
      request.name.split(" ")
    );

    console.log('uniqueName for new landing page', uniqueName);

    // Create the landing page
    const landingPage = await this.repository.create({
      ...request,
      title,
      content,
      uniqueName,
      companyId: currentUser.companyId
    });

    return landingPage;
  }

  /* --------------------------------------  */

  @patch('/landingpage/{id}')
  async update(
    @param.path.number('id') id: number,
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(LandingPage, {
            title: 'PatchLandingPageRequest',
            exclude: ['titlePrompt', 'contentPrompt', 'id', 'companyId', 'uniqueName']
          })

        },
      },
    })
    request: PatchRequest,
    @inject('currentUser') currentUser: User
  ) {
    const currentLandingPage = await this.findLandingPage(
      id, currentUser
    );

    this.validateInput(request);

    await this.repository.updateById(id, {
      ...request
    });

    const lp = new LandingPage({
      ...currentLandingPage,
      ...request
    });
    return lp;
  }

  /* --------------------------------------  */

  @del('/landingpage/{id}')
  async delete(
    @param.path.number('id') id: number,
    @inject('currentUser') currentUser: User
  ) {
    await this.findLandingPage(
      id, currentUser
    );

    await this.repository.deleteById(id);
  }
}
