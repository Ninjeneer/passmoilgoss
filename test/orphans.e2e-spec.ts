import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import chai, { expect } from 'chai';

import { AuthApiModule } from '../src/api/auth-api/auth-api.module';
import { CreateOrphanDto } from '../src/core/orphan/dto/create-orphan.dto';
import { Gender } from '../src/core/orphan/entities/orphan.entity';
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

async function createOrphan(httpClient: HttpClient, createDto: CreateOrphanDto) {
	const response = await httpClient.post('/orphans', createDto);
	expect(response.statusCode).to.be.eq(HttpStatus.CREATED);
	expect(response.json<Orphan>()).to.containSubset(createDto);
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
			const orphan = await createOrphan(httpClient, OrphanFactory.buildCreateOrphanDto());
			const response = await httpClient.get(`/orphans`);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<Orphan[]>()).to.include.deep.members([orphan]);
		});

		it('Should be able to find all countries (GET /orphans/countries)', async () => {
			const httpClient = await getHttpClient(null, app);
			const orphan = await createOrphan(httpClient, OrphanFactory.buildCreateOrphanDto());
			const response = await httpClient.get(`/orphans/countries`);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<string[]>()).to.include.members([orphan.country]);
		});

		it('Should be able to filter orphans (GET /orphans/)', async () => {
			const httpClient = await getHttpClient(null, app);
			const orphan = await createOrphan(httpClient, { ...OrphanFactory.buildCreateOrphanDto(), gender: Gender.M });
			const orphan2 = await createOrphan(httpClient, { ...OrphanFactory.buildCreateOrphanDto(), gender: Gender.F });
			let response = await httpClient.get(`/orphans`, { gender: 'f' });
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<Orphan[]>()).to.include.deep.members([orphan2]);
			expect(response.json<Orphan[]>()).to.not.include.deep.members([orphan]);

			const orphan3 = await createOrphan(httpClient, {
				...OrphanFactory.buildCreateOrphanDto(),
				gender: Gender.M,
				eyes: 'Marron'
			});
			const orphan4 = await createOrphan(httpClient, {
				...OrphanFactory.buildCreateOrphanDto(),
				gender: Gender.F,
				eyes: 'Vert'
			});
			const orphan5 = await createOrphan(httpClient, {
				...OrphanFactory.buildCreateOrphanDto(),
				gender: Gender.F,
				eyes: 'Bleu'
			});
			response = await httpClient.get(`/orphans`, { eyes: 'Marron|Vert' });
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<Orphan[]>()).to.include.deep.members([orphan3, orphan4]);
			expect(response.json<Orphan[]>()).to.not.include.deep.members([orphan5]);
		});

		it('Should be able to sort orphans (GET /orphans/)', async () => {
			const httpClient = await getHttpClient(null, app);
			const orphan = await createOrphan(httpClient, {
				...OrphanFactory.buildCreateOrphanDto(),
				gender: Gender.M,
				firstname: 'Aaa'
			});
			const orphan2 = await createOrphan(httpClient, {
				...OrphanFactory.buildCreateOrphanDto(),
				gender: Gender.F,
				lastname: 'Bbb'
			});
			let response = await httpClient.get(`/orphans`, { sort: 'firstname' });
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			let orphans = response.json<Orphan[]>();
			expect(orphans.map((o) => o.id).indexOf(orphan.id)).to.be.lt(orphans.map((o) => o.id).indexOf(orphan2.id));

			response = await httpClient.get(`/orphans`, { sort: '-firstname' });
			orphans = response.json<Orphan[]>();
			expect(orphans.map((o) => o.id).indexOf(orphan.id)).to.be.gt(orphans.map((o) => o.id).indexOf(orphan2.id));
		});

		it('Should be able to find one (GET /orphans/:id)', async () => {
			const httpClient = await getHttpClient(null, app);
			const orphan = await createOrphan(httpClient, OrphanFactory.buildCreateOrphanDto());
			const response = await httpClient.get(`/orphans/${orphan.id}`);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<Orphan>()).to.containSubset(orphan);
		});
	});

	describe('As admin orphan', () => {
		it('Should be able to update orphan (PATCH /orphans/:id)', async () => {
			const httpClient = await getHttpClient(null, app);
			const orphan = await createOrphan(httpClient, OrphanFactory.buildCreateOrphanDto());
			const newOrphanData = OrphanFactory.buildCreateOrphanDto();
			const response = await httpClient.patch(`/orphans/${orphan.id}`, newOrphanData);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<Orphan>()).to.containSubset(newOrphanData);
		});

		it('Should be able to create a orphan (POST /orphans)', async () => {
			const httpClient = await getHttpClient(null, app);
			await createOrphan(httpClient, OrphanFactory.buildCreateOrphanDto());
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

		it('Should be able to upvote orphan (PATCH /orphans/:id/:stat/upvote)', async () => {
			const httpClient = await getHttpClient(null, app);
			const orphan = await createOrphan(httpClient, { ...OrphanFactory.buildCreateOrphanDto(), calm: 10 });
			const response = await httpClient.patch(`/orphans/${orphan.id}/calm/upvote`);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<Orphan>().calm).to.be.eq(orphan.calm + 0.15);
		});

		it('Should be able to downvote orphan (PATCH /orphans/:id/:stat/upvote)', async () => {
			const httpClient = await getHttpClient(null, app);
			const orphan = await createOrphan(httpClient, { ...OrphanFactory.buildCreateOrphanDto(), calm: 10 });
			const response = await httpClient.patch(`/orphans/${orphan.id}/calm/downvote`);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<Orphan>().calm).to.be.eq(orphan.calm - 0.15);
		});
	});

	this.afterEach(async () => {
		const httpClient = await getHttpClient(null, app);
		for (const orphan of createdOrphans) {
			await httpClient.delete(`/orphans/${orphan.id}`);
		}
	});
});
