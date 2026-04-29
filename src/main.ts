import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

import { ApplicationErrorFilter } from './common/filters/application-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register global filter for ApplicationError
  app.useGlobalFilters(new ApplicationErrorFilter());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Cooko API')
    .setDescription('API documentation for Cooko application')
    .setVersion('1.0')
    .build();

  const theme = new SwaggerTheme();
  const darkStyle = theme.getBuffer(SwaggerThemeNameEnum.DARK);
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory, {
    customCss: darkStyle,
  });

  await app.listen(3000, () => {
    console.log(
      `📚 Swagger documentation available at http://localhost:${3000}/api-docs`,
    );
  });
}
bootstrap();
