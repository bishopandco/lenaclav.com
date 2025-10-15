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

    const api = new sst.aws.Function("Api", {
      handler: "api/index.handler",
      runtime: "nodejs20.x",
      url: true,
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
