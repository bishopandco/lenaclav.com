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

    const api = new sst.aws.Function("Api", {
      handler: "api/index.handler",
      runtime: "nodejs20.x",
      url: true,
      link: [table],
      environment: {
        DYNAMODB_TABLE_NAME: table.name,
      },
    });

    const frontend = new sst.aws.StaticSite("Frontend", {
      build: {
        command: "cd frontend && npm install && npm run build",
        output: "frontend/dist",
      },
      environment: {
        VITE_API_URL: api.url,
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
