import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'landing_page'
})
export class LandingPage extends Entity {

  @property({
    id: true,
    type: 'number'
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 1,
      maxLength: 200
    }
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    name: 'unique_name'
  })
  uniqueName: string;

  @property({
    type: 'number',
    name: 'company_id',
    hidden: true
  })
  companyId: number;

  @property({
    type: 'string',
    name: 'title_prompt',
    required: true,
    jsonSchema: {
      maxLength: 500
    }
  })
  titlePrompt: string;

  @property({
    type: 'string',
    name: 'title',
    required: true,
    jsonSchema: {
      maxLength: 200
    }
  })
  title: string;

  @property({
    type: 'string',
    name: 'content_prompt',
    required: true,
    jsonSchema: {
      maxLength: 500
    }
  })
  contentPrompt: string;

  @property({
    type: 'string',
    name: 'content',
    required: true,
    jsonSchema: {
      maxLength: 5000
    }
  })
  content: string;

  @property({
    type: 'string',
    name: 'cta',
    required: true,
    jsonSchema: {
      maxLength: 50
    }
  })
  callToAction: string; // Call to action - text of the button

  @property({
    type: 'string',
    name: 'video',
    required: true,
    jsonSchema: {
      maxLength: 500
    }
  })
  video: string;

  @property({
    type: 'string',
    name: 'color',
    required: true,
    jsonSchema: {
      maxLength: 15
    }
  })
  color: string; // Color code

  constructor(data?: Partial<LandingPage>) {
    super(data);
  }
}

export interface LandingPageRelations {

}
