import {CoreBindings, inject} from '@loopback/core';
import {IsolationLevel, juggler} from '@loopback/repository';
import {DefaultSequence, RequestContext} from '@loopback/rest';
import {IcebergerApplication} from './application';

export class MySequence extends DefaultSequence {
  @inject(CoreBindings.APPLICATION_INSTANCE) app: IcebergerApplication

  async handle(context: RequestContext): Promise<void> {
    const dataSource: juggler.DataSource = await this.app.get('datasources.mysql');
    const transaction = await dataSource.beginTransaction({
      isolationLevel: IsolationLevel.READ_COMMITTED,
      timeout: 10000, // 30000ms = 30s
    });
    context.bind('transaction').to(transaction);
    try {
      // Invoke registered Express middleware
      const finished = await this.invokeMiddleware(context);
      if (finished) {
        // The response been produced by the middleware chain
        return;
      }

      // findRoute() produces an element
      const route = this.findRoute(context.request);

      // parseParams() uses the route element and produces the params element
      const params = await this.parseParams(context.request, route);

      // invoke() uses both the route and params elements to produce the result (OperationRetVal) element
      const result = await this.invoke(route, params);

      await transaction.commit();

      // send() uses the result element
      this.send(context.response, result);
    } catch (error) {
      console.log('eror caught in sequence', error);
      await transaction.rollback();
      this.reject(context, error);
    }
  }
}
