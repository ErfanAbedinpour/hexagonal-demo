<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>
## Payment Service - Hexagonal Architecture Demo

## Running the Project

`npm install && npm run start:dev`

## API Endpoints

- POST /payments - Process payment
- GET /payments/:id/status - Check status
- GET /payments - List all transactions

## Demonstrating Architecture Value

### Adding a New Payment Provider (Square)

1. Create src/infrastructure/adapters/square/square-payment.adapter.ts
2. Implement PaymentProviderPort interface
3. Register adapter in app.module.ts
4. **No changes to:** use cases, domain entities, controllers, other providers

### Switching from In-Memory to PostgreSQL

1. Create PostgresTransactionRepository implementing same port
2. Change one line in app.module.ts binding
3. **No changes to:** use cases, domain, controllers

## Why This Matters

This architecture isolates business logic from infrastructure changes,
making the system maintainable as it scales to 9+ polyglot services.

## Example curl Commands

### Process a Payment

```
curl -X POST http://localhost:3000/payments \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: test' \
  -d '{"amount": 100, "currency": "USD", "provider": "stripe", "customerId": "c1"}'
```

### Get Payment Status

```
curl -X GET http://localhost:3000/payments/<transactionId>/status \
  -H 'X-API-Key: test'
```

### List All Transactions

```
curl -X GET http://localhost:3000/payments \
  -H 'X-API-Key: test'
```

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
