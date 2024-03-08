import {Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise} from '@loopback/context';
import {repository} from '@loopback/repository';
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
    console.log('context for auth interceptor');
    const context: any = await invocationCtx.get('rest.http.request.context');
    console.log(context);
    const authHeader: string = context.request.headers.authorization;
    const token = authHeader.split(" ")[1];
    const service = new CognitoVerify();
    const cognitoUser = await service.verify(token);
    console.log('is verified ', cognitoUser);
    const user = await this.userRepository.findOne({
      where: {cognitoId: cognitoUser}
    })
    console.log('user found', user);
    return next();
  }
}
