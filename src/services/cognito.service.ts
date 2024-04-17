import {AdminCreateUserCommand, AdminSetUserPasswordCommand, AuthFlowType, AuthenticationResultType, CognitoIdentityProviderClient, InitiateAuthCommand, MessageActionType} from "@aws-sdk/client-cognito-identity-provider";
import {Transaction} from '@loopback/repository';
import HttpError, {STATUS_BAD_REQUEST, STATUS_UNAUTHORIZED} from '../common/http';
import {User} from '../models/user.model';
import {UserRepository} from '../repositories/user.repository';

/**
 * Class to integrate AWS Cognito services
 */

export class CognitoService {

  private client: CognitoIdentityProviderClient;

  CLIENT_ID: string;
  USER_POOL_ID: string;

  constructor() {
    if (!process.env.AWS_COGNITO_USER_POOL ||
      !process.env.AWS_COGNITO_CLIENT_ID ||
      !process.env.AWS_DEFAULT_REGION
    ) {
      throw new Error(`env variables not found`);
    }
    this.client = new CognitoIdentityProviderClient({
      region: process.env.AWS_DEFAULT_REGION
    });
    this.CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID;
    this.USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL;
  }

  async signUp(
    user: User,
    password: string,
    userRepo: UserRepository,
    tx: Transaction
  ): Promise<void> {
    const input = {
      UserPoolId: this.USER_POOL_ID,
      Username: user.email,
      MessageAction: MessageActionType.SUPPRESS,
      UserAttributes: [
        {Name: "email", Value: user.email},
      ]
    }
    const command = new AdminCreateUserCommand(input);
    try {
      const userPassword = password;
      const result = await this.client.send(command);
      const cognitoUsername = result.User!.Username;
      await userRepo.updateById(user.id, {
        cognitoId: cognitoUsername
      }, {transaction: tx});
      const passwordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: this.USER_POOL_ID,
        Username: user.email,
        Password: userPassword,
        Permanent: true
      });
      await this.client.send(passwordCommand);
    } catch (err: any) {
      if (err.$metadata && err.$metadata.httpStatusCode < 500) {
        throw new HttpError(
          err.message,
          STATUS_BAD_REQUEST
        );
      }
      throw err;
    }
  }

  async authenticate(email: string, password: string): Promise<AuthenticationResultType> {
    const input = {
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      },
      ClientId: this.CLIENT_ID
    }
    const command = new InitiateAuthCommand(input);
    try {
      const result = await this.client.send(command);
      if (result.AuthenticationResult === undefined) {
        throw new Error(`auth result not found`);
      }
      return result.AuthenticationResult;
    } catch (err: any) {
      if (err.$metadata && err.$metadata.httpStatusCode < 500) {
        throw new HttpError(
          err.message,
          STATUS_UNAUTHORIZED
        );
      }
      throw err;
    }
  }
}
