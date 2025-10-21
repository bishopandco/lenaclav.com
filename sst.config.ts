/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "lenaclav-app",
      home: "aws",
      removal: input?.stage === "production" ? "retain" : "remove",
    };
  },
  async run() {
    const current = await aws.getCallerIdentity({});
    if (current.accountId !== "950915784758") {
      throw new Error("🛑 WRONG AWS ACCOUNT ⚠️");
    }

    const domainName =
      $app.stage === "production"
        ? "lenaclav.com"
        : `${$app.stage}.lenaclav.com`;

    const table = new sst.aws.Dynamo("LenaclavTable", {
      fields: {
        pk: "string",
        sk: "string",
        gsi1pk: "string",
        gsi1sk: "string",
        gsi2pk: "string",
        gsi2sk: "string",
      },
      primaryIndex: {
        hashKey: "pk",
        rangeKey: "sk",
      },
      globalIndexes: {
        "gsi1pk-gsi1sk-index": {
          hashKey: "gsi1pk",
          rangeKey: "gsi1sk",
        },
        "gsi2pk-gsi2sk-index": {
          hashKey: "gsi2pk",
          rangeKey: "gsi2sk",
        },
      },
    });

    const userPool = new sst.aws.CognitoUserPool("LenaclavUserPool", {
      usernames: ["email"],
      transform: {
        userPool: {
          autoVerifiedAttributes: ["email"],
        },
      },
      verify: {
        emailSubject: "Verify your lenaclav.com account",
        emailMessage: "Your verification code is {####}",
      },
    });

    const userPoolClient = userPool.addClient("LenaclavWeb", {
      transform: {
        client: {
          accessTokenValidity: 24,
          idTokenValidity: 24,
          refreshTokenValidity: 30,
          tokenValidityUnits: {
            accessToken: "hours",
            idToken: "hours",
            refreshToken: "days",
          },
        },
      },
    });

    const api = new sst.aws.Function("Api", {
      handler: "api/index.handler",
      runtime: "nodejs20.x",
      url: true,
      link: [table, userPool, userPoolClient],
      environment: {
        DYNAMODB_TABLE_NAME: table.name,
        COGNITO_USER_POOL_ID: userPool.id,
        COGNITO_CLIENT_ID: userPoolClient.id,
      },
    });

    const frontend = new sst.aws.StaticSite("Frontend", {
      build: {
        command: "cd frontend && npm install && npm run build",
        output: "frontend/dist",
      },
      environment: {
        VITE_API_URL: api.url,
        VITE_AWS_REGION: process.env.AWS_REGION || "us-east-1",
        VITE_COGNITO_USER_POOL_ID: userPool.id,
        VITE_COGNITO_CLIENT_ID: userPoolClient.id,
      },
      domain: {
        name: domainName,
      },
    });

    return {
      apiUrl: api.url,
      frontendUrl: frontend.url,
    };
  },
});
