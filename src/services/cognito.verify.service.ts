import {CognitoJwtVerifier} from "aws-jwt-verify";

export class CognitoVerify {

  private verifier: any;
  CLIENT_ID: string;
  USER_POOL_ID: string;

  constructor() {
    if (!process.env.AWS_COGNITO_USER_POOL || !process.env.AWS_COGNITO_CLIENT_ID) {
      throw new Error(`env variables not found`);
    }
    this.CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID;
    this.USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL;
    this.verifier = CognitoJwtVerifier.create({
      userPoolId: this.USER_POOL_ID,
      clientId: this.CLIENT_ID,
      tokenUse: "access"
    });
  }

  async verify(token: string): Promise<string> {
    try {
      const result = await this.verifier.verify(token);
      return result.username;
    } catch (err: any) {
      console.log(err);
      throw err;
    }
  }
}
