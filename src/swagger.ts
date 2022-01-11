import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { INestApplication } from '@nestjs/common';

export default class SwaggerDocumentation {
	private app: INestApplication;

	constructor(app: INestApplication) {
		this.app = app;
	}

	public serve(): void {
		// Configure swagger
		const swaggerConfig = new DocumentBuilder()
			.setTitle("Pass Moi L'Goss API")
			.setContact('Loan Alouache', '', 'alouache.loan@gmail.com')
			.setVersion('1.0')
			.addTag('Users')
			.addTag('Authentication')
			.addTag('Orphans')
			// .addBearerAuth()
			.build();

		const swaggerDocument = SwaggerModule.createDocument(this.app, swaggerConfig);
		SwaggerModule.setup('api', this.app, swaggerDocument);
	}
}
