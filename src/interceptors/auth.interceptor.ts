import {Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise} from '@loopback/context';
import {repository} from '@loopback/repository';
import HttpError, {STATUS_UNAUTHORIZED} from '../common/http';
import {UserRepository} from '../repositories/user.repository';
import {CognitoVerify} from '../services/cognito.verify.service';

export class AuthInterceptor implements Provider<Interceptor> {
  constructor(
    @repository(UserRepository) private userRepository: UserRepository
  ) { }

  value(): Interceptor {
    return this.intercept.bind(this);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ): Promise<InvocationResult> {
    // Get the current controller target
    const context: any = await invocationCtx.get('rest.http.request.context');
    console.log(context);
    const authHeader: string = context.request.headers.authorization;
    const token = authHeader.split(" ")[1];
    try {
      const service = new CognitoVerify();
      const cognitoUser = await service.verify(token);
      const user = await this.userRepository.findOne({
        where: {cognitoId: cognitoUser},
        include: [{
          relation: 'roles',
          scope: {
            include: ['permissions']
          }
        }]
      })
      console.log('user found', user);
      return next();
    } catch (err: any) {
      throw new HttpError(
        `unauthorized`,
        STATUS_UNAUTHORIZED
      );
    }
  }
}
