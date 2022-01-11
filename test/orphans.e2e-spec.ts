import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import chai, { expect } from 'chai';

import { AuthApiModule } from '../src/api/auth-api/auth-api.module';
import HttpClient from './HttpClient';
import { Orphan } from '@prisma/client';
import { OrphanApiModule } from '../src/api/orphan-api/orphan-api.module';
import OrphanFactory from '../src/core/orphan/orphan.factory';
import { OrphanService } from '../src/core/orphan/orphan.service';
import { Test } from '@nestjs/testing';
import chaiSubset from 'chai-subset';
import { getHttpClient } from './utils';

chai.use(chaiSubset);

const createdOrphans: Orphan[] = [];

async function createOrphan(httpClient: HttpClient) {
	const orphan = OrphanFactory.buildCreateOrphanDto();
	const response = await httpClient.post('/orphans', orphan);
	expect(response.statusCode).to.be.eq(HttpStatus.CREATED);
	expect(response.json<Orphan>()).to.containSubset(orphan);
	createdOrphans.push(response.json<Orphan>());
	return response.json<Orphan>();
}

describe('OrphanController (e2e)', function () {
	this.timeout(500000);

	let app: NestFastifyApplication;
	let orphanService: OrphanService;

	this.beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [OrphanApiModule, AuthApiModule]
		}).compile();
		app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
		app.useGlobalPipes(new ValidationPipe());

		await app.init();
		await app.getHttpAdapter().getInstance().ready();
		orphanService = app.get<OrphanService>(OrphanService);
	});

	describe('As basic orphan', () => {
		it('Should be able to find all (GET /orphans/)', async () => {
			const httpClient = await getHttpClient(null, app);
			const orphan = await createOrphan(httpClient);
			const response = await httpClient.get(`/orphans`);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<Orphan[]>()).to.include.deep.members([orphan]);
		});

		it('Should be able to find one (GET /orphans/:id)', async () => {
			const httpClient = await getHttpClient(null, app);
			const orphan = await createOrphan(httpClient);
			const response = await httpClient.get(`/orphans/${orphan.id}`);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<Orphan>()).to.containSubset(orphan);
		});
	});

	describe('As admin orphan', () => {
		it('Should be able to update orphan (PATCH /orphans/:id)', async () => {
			const httpClient = await getHttpClient(null, app);
			const orphan = await createOrphan(httpClient);
			const newOrphanData = OrphanFactory.buildCreateOrphanDto();
			const response = await httpClient.patch(`/orphans/${orphan.id}`, newOrphanData);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<Orphan>()).to.containSubset(newOrphanData);
		});

		it('Should be able to create a orphan (POST /orphans)', async () => {
			const httpClient = await getHttpClient(null, app);
			await createOrphan(httpClient);
		});

		it('Should be able to delete a orphan (DELETE /orphans/:id)', async () => {
			const httpClient = await getHttpClient(null, app);
			// Create a orphan
			const orphan = OrphanFactory.buildOne();
			let response = await httpClient.post('/orphans', { ...orphan });
			expect(response.statusCode).to.be.eq(HttpStatus.CREATED);
			createdOrphans.push(response.json<Orphan>());

			// Delete it
			response = await httpClient.delete(`/orphans/${createdOrphans[createdOrphans.length - 1].id}`);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);

			response = await httpClient.get(`/orphans/${createdOrphans[createdOrphans.length - 1].id}`);
			expect(response.statusCode).to.be.eq(HttpStatus.NOT_FOUND);
			createdOrphans.pop();
		});
	});

	this.afterEach(async () => {
		const httpClient = await getHttpClient(null, app);
		for (const orphan of createdOrphans) {
			await httpClient.delete(`/orphans/${orphan.id}`);
		}
	});
});
