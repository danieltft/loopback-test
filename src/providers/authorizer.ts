import {AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer} from '@loopback/authorization';
import {Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import HttpError, {STATUS_UNAUTHORIZED} from '../common/http';
import {UserRepository} from '../repositories/user.repository';
import {CognitoVerify} from '../services/cognito.verify.service';

export class AuthorizationProvider implements Provider<Authorizer> {
  constructor(
    @repository(UserRepository) private userRepository: UserRepository
  ) { }

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    ctx: AuthorizationContext,
    metadata: AuthorizationMetadata
  ) {
    try {
      const request: any = await ctx.invocationContext.get('rest.http.request');
      const authHeader: string = request.headers.authorization;
      const token = authHeader.split(" ")[1];
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

      if (user === null) {
        throw new Error();
      }

      const userPermissions: string[] = [];
      user.roles.map((r) => {
        r.permissions.map((p) => userPermissions.push(p.name))
      });

      ctx.invocationContext.bind('currentUser').to({
        ...user,
        roles: undefined
      });

      if (metadata.resource === undefined) {
        return AuthorizationDecision.ALLOW;
      }

      if (userPermissions.includes(metadata.resource as string)) {
        return AuthorizationDecision.ALLOW
      }

      return AuthorizationDecision.DENY;
    } catch (err: any) {
      throw new HttpError(
        `unauthorized`,
        STATUS_UNAUTHORIZED
      );
    }
  }
}
