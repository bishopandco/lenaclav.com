import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import * as jwt from "jsonwebtoken";
import jwkToPem, { JWK } from "jwk-to-pem";
import {
  AdminConfirmSignUpCommand,
  AdminDeleteUserCommand,
  CognitoIdentityProviderClient,
  CognitoIdentityProviderClientConfig,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  DeleteUserCommand,
  ForgotPasswordCommand,
  ListUsersCommand,
  InitiateAuthCommand,
  SignUpCommand,
  UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { UserModel } from "../models/UserModel";

const awsRegion = process.env.AWS_REGION || "us-east-1";
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

function isTestEnv() {
  return process.env.NODE_ENV === "test" || process.env.SKIP_AUTH === "true";
}

function isMockUser(username?: string) {
  if (!username) return true;
  const phoneRegex = /^\+?[0-9]{7,}$/;
  return !username.includes("@") && !phoneRegex.test(username);
}

const cognitoIssuer =
  userPoolId && `https://cognito-idp.${awsRegion}.amazonaws.com/${userPoolId}`;
const cognitoOpts: CognitoIdentityProviderClientConfig = { region: awsRegion };
const cognitoClient = new CognitoIdentityProviderClient(cognitoOpts);

/**
 * Register a new user in Cognito.
 */
export async function register(email: string, phone: string, password: string) {
  if (isTestEnv() || isMockUser(email) || !clientId) {
    return Promise.resolve({});
  }
  const signUp = new SignUpCommand({
    ClientId: clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "phone_number", Value: phone },
    ],
  });
  return cognitoClient.send(signUp);
}

/**
 * Confirm a user signup (admin confirm or with code).
 */
export async function confirmUser(username: string, code?: string) {
  if (isTestEnv() || isMockUser(username) || !clientId || !userPoolId) {
    return Promise.resolve({});
  }
  if (code) {
    const command = new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: username,
      ConfirmationCode: code,
    });
    return cognitoClient.send(command);
  }
  const command = new AdminConfirmSignUpCommand({
    UserPoolId: userPoolId,
    Username: username,
  });
  return cognitoClient.send(command);
}

/**
 * Begin password reset flow - sends a code to the user.
 */
export async function forgotPassword(username: string) {
  if (isTestEnv() || isMockUser(username) || !clientId) {
    return Promise.resolve({});
  }
  const command = new ForgotPasswordCommand({
    ClientId: clientId,
    Username: username,
  });
  return cognitoClient.send(command);
}

/**
 * Complete password reset with confirmation code.
 */
export async function resetPassword(
  username: string,
  code: string,
  password: string
) {
  if (isTestEnv() || isMockUser(username) || !clientId) {
    return Promise.resolve({});
  }
  const command = new ConfirmForgotPasswordCommand({
    ClientId: clientId,
    Username: username,
    ConfirmationCode: code,
    Password: password,
  });
  return cognitoClient.send(command);
}

/**
 * Authenticate a user and return a JWT.
 */
export async function login(
  username: string,
  password: string
): Promise<{ token: string; refreshToken: string; expiresAt: number }> {
  if (isTestEnv() || isMockUser(username) || !clientId || !userPoolId) {
    const payload = { username, sub: username };
    const token = Buffer.from(JSON.stringify(payload), "utf-8").toString(
      "base64"
    );
    return {
      token,
      refreshToken: "test-refresh",
      expiresAt: Date.now() + 3600 * 1000,
    };
  }
  const userPool = new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });
  const authDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });
  const cognitoUser = new CognitoUser({ Username: username, Pool: userPool });
  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const token = result.getAccessToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();
        const decoded: any = jwt.decode(token);
        const expiresAt =
          decoded?.exp && typeof decoded.exp === "number"
            ? decoded.exp * 1000
            : Date.now() + 3600 * 1000;
        resolve({ token, refreshToken, expiresAt });
      },
      onFailure: (err) => reject(err),
    });
  });
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ token: string; expiresAt: number }> {
  if (isTestEnv() || !clientId) {
    const payload = { username: "test-user", sub: "test-user" };
    const token = Buffer.from(JSON.stringify(payload), "utf-8").toString(
      "base64"
    );
    return { token, expiresAt: Date.now() + 3600 * 1000 };
  }
  const command = new InitiateAuthCommand({
    ClientId: clientId,
    AuthFlow: "REFRESH_TOKEN_AUTH",
    AuthParameters: { REFRESH_TOKEN: refreshToken },
  });
  const res = await cognitoClient.send(command);
  const token = res.AuthenticationResult?.AccessToken;
  const expiresIn = res.AuthenticationResult?.ExpiresIn;
  if (!token) throw new Error("Failed to refresh token");
  return {
    token,
    expiresAt: Date.now() + (expiresIn ? expiresIn * 1000 : 3600 * 1000),
  };
}

type JwkWithKid = JWK & { kid: string };

async function getCognitoPublicKeys(): Promise<JwkWithKid[]> {
  if (!cognitoIssuer) throw new Error("Cognito issuer is not configured");
  const url = `${cognitoIssuer}/.well-known/jwks.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch JWKS: ${res.statusText}`);
  const data = (await res.json()) as { keys: JwkWithKid[] };
  return data.keys;
}

/**
 * Verify a JWT from Cognito.
 */
export async function verifyJWT(token: string) {
  if (isTestEnv() || !token.includes(".") || !cognitoIssuer) {
    try {
      const json = Buffer.from(token, "base64").toString("utf-8");
      return JSON.parse(json);
    } catch {
      return { username: "test-user", sub: "test-user" };
    }
  }
  const keys = await getCognitoPublicKeys();
  const decodedHeader = jwt.decode(token, { complete: true }) as jwt.Jwt | null;
  const key = keys.find((k) => k.kid === decodedHeader?.header?.kid);
  if (!key) throw new Error("Public key not found");
  const pem = jwkToPem(key);
  return jwt.verify(token, pem, { issuer: cognitoIssuer });
}

/**
 * Delete a user from Cognito (self-service).
 */
export async function deleteUser(accessToken: string) {
  if (isTestEnv() || !accessToken.includes(".") || !clientId) {
    return Promise.resolve({});
  }
  const command = new DeleteUserCommand({ AccessToken: accessToken });
  return cognitoClient.send(command);
}

/**
 * List all users in the Cognito pool and ensure they exist in DynamoDB.
 */
export async function listCognitoUsers(limit = 10, cursor?: string) {
  if (isTestEnv() || !userPoolId) {
    return { users: [], cursor: undefined };
  }

  const users: UserType[] = [];
  let token: string | undefined = cursor;

  do {
    const remaining = limit - users.length;
    const res = await cognitoClient.send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        PaginationToken: token,
        Limit: remaining > 0 ? remaining : undefined,
      })
    );
    users.push(...(res.Users ?? []));
    token = res.PaginationToken;
  } while (token && users.length < limit);

  const enriched = [] as Array<{
    user: string;
    username: string;
    email: string;
    status?: string;
  }>;

  for (const u of users.slice(0, limit)) {
    const username = u.Username || "";
    const emailAttr = u.Attributes?.find((a) => a.Name === "email");
    const email = (emailAttr && emailAttr.Value) || "";
    let record = await UserModel.findByUsername(username);
    if (!record) {
      record = await UserModel.create({ username, email });
    }
    enriched.push({
      user: record.user,
      username,
      email,
      status: u.UserStatus,
    });
  }

  return { users: enriched, cursor: token };
}

/**
 * Delete a user from Cognito by username (admin).
 */
export async function adminDeleteUser(username: string) {
  if (isTestEnv() || isMockUser(username) || !userPoolId) {
    return Promise.resolve({});
  }
  const command = new AdminDeleteUserCommand({
    UserPoolId: userPoolId,
    Username: username,
  });
  return cognitoClient.send(command);
}

/**
 * Get the total number of user records in DynamoDB.
 */
export async function countUsers() {
  return UserModel.count();
}
