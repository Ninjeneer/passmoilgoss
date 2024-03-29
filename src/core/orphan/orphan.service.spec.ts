import 'mocha';

import { Gender, Orphan } from './entities/orphan.entity';
import { Test, TestingModule } from '@nestjs/testing';
import chai, { expect } from 'chai';

import { CreateOrphanDto } from './dto/create-orphan.dto';
import { NotFoundException } from '@nestjs/common';
import OrphanFactory from './orphan.factory';
import OrphanRepository from './orphan.repository';
import { OrphanService } from './orphan.service';
import { PrismaService } from '../../prisma.service';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';

chai.use(chaiSubset);
chai.use(chaiAsPromised);

const createdOrphans: Orphan[] = [];

async function createOrphan(orphanService: OrphanService, createDto: CreateOrphanDto) {
	const createdOrphan = await orphanService.create(createDto);
	expect(createdOrphan).containSubset({ ...createDto, birthDate: new Date(createDto.birthDate) });
	createdOrphans.push(createdOrphan);
	return createdOrphan;
}

describe('OrphanService', function () {
	this.timeout(100000);
	let orphanService: OrphanService;
	let module: TestingModule;

	beforeEach(async () => {
		module = await Test.createTestingModule({
			providers: [OrphanService, PrismaService, OrphanRepository]
		}).compile();

		orphanService = module.get(OrphanService);
	});

	afterEach(async () => {
		for (const orphan of createdOrphans) {
			try {
				await orphanService.remove(orphan.id);
			} catch (e) {}
		}
		await module.get(PrismaService).$disconnect();
		await module.close();
	});
	it('should be defined', () => {
		expect(orphanService).to.not.be.null;
	});

	describe('findAll', () => {
		it('Should return an array of orphans', async () => {
			const o1 = await createOrphan(orphanService, await OrphanFactory.buildCreateOrphanDto());
			const o2 = await createOrphan(orphanService, await OrphanFactory.buildCreateOrphanDto());
			const orphans = await orphanService.findAll();
			expect(orphans).to.include.deep.members([o1, o2]);
		});

		it('Should return an array of countries', async () => {
			const o1 = await createOrphan(orphanService, await OrphanFactory.buildCreateOrphanDto());
			const o2 = await createOrphan(orphanService, await OrphanFactory.buildCreateOrphanDto());
			const countries = await orphanService.findAvailableCountries();
			expect(countries).to.include.members([o1.country, o2.country]);
		});

		it('Should filter orphans', async () => {
			// Filter on gender
			const o1 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.M
			});
			const o2 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.F
			});
			let orphans = await orphanService.findAll({ gender: Gender.M });
			expect(orphans).to.include.deep.members([o1]);
			expect(orphans).to.not.include.deep.members([o2]);

			// Filter on eyes
			const o3 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.M,
				eyes: 'Marron'
			});
			const o4 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.F,
				eyes: 'Marron'
			});
			const o5 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.M,
				eyes: 'Bleu'
			});
			orphans = await orphanService.findAll({ eyes: ['Marron'] });
			expect(orphans).to.include.deep.members([o3, o4]);
			expect(orphans).to.not.include.deep.members([o5]);

			// Filter on country
			const o6 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.M,
				eyes: 'Marron',
				country: 'France'
			});
			const o7 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.M,
				eyes: 'Marron',
				country: 'China'
			});
			orphans = await orphanService.findAll({ countries: ['France'] });
			expect(orphans).to.include.deep.members([o6]);
			expect(orphans).to.not.include.deep.members([o7]);

			// Filter on hairs
			const o8 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.M,
				eyes: 'Marron',
				country: 'France',
				hairs: 'Brun'
			});
			const o9 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.M,
				eyes: 'Marron',
				country: 'France',
				hairs: 'Brun'
			});
			const o10 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.M,
				eyes: 'Marron',
				country: 'France',
				hairs: 'Roux'
			});
			orphans = await orphanService.findAll({ hairs: ['Brun'] });
			expect(orphans).to.include.deep.members([o8, o9]);
			expect(orphans).to.not.include.deep.members([o10]);

			// Filter on firstname
			const o11 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				firstname: 'aaaaaa'
			});
			const o12 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				firstname: 'bbbbbb'
			});
			orphans = await orphanService.findAll({ firstname: 'aaa' });
			expect(orphans).to.include.deep.members([o11]);
			expect(orphans).to.not.include.deep.members([o12]);

			// Multi filter
			orphans = await orphanService.findAll({ gender: Gender.M, eyes: ['Marron'] });
			expect(orphans).to.include.deep.members([o3, o6, o7, o8, o9]);
			expect(orphans).to.not.include.deep.members([o2, o4]);
		});

		it('Should sort orphans', async () => {
			const o1 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.M,
				firstname: 'Aaa'
			});
			const o2 = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				gender: Gender.F,
				firstname: 'Bbb'
			});

			let orphans = await orphanService.findAll(null, 'firstname');
			expect(orphans.map((o) => o.id).indexOf(o1.id)).to.be.lt(orphans.map((o) => o.id).indexOf(o2.id));

			orphans = await orphanService.findAll(null, '-firstname');
			expect(orphans.map((o) => o.id).indexOf(o1.id)).to.be.gt(orphans.map((o) => o.id).indexOf(o2.id));
		});

		it('Should calculate orphan score', async () => {
			let orphan = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				beauty: 10,
				hygiene: 10,
				intelligence: 10,
				calm: 10,
				sociability: 10
			});
			expect(orphan.score).to.be.eq(10);

			orphan = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				beauty: 20,
				hygiene: 20,
				intelligence: 10,
				calm: 0,
				sociability: 0
			});
			expect(orphan.score).to.be.eq(10);

			orphan = await createOrphan(orphanService, {
				...(await OrphanFactory.buildCreateOrphanDto()),
				beauty: 17,
				hygiene: 19,
				intelligence: 11,
				calm: 8,
				sociability: 13
			});
			expect(orphan.score).to.be.eq(13.6);
		});
	});

	describe('create', () => {
		it('Should create a orphan', async () => {
			await createOrphan(orphanService, await OrphanFactory.buildCreateOrphanDto());
		});
	});

	describe('find', () => {
		it('Should find the created orphan', async () => {
			const orphan = await createOrphan(orphanService, await OrphanFactory.buildCreateOrphanDto());
			expect(await orphanService.findOne(orphan.id)).containSubset(orphan);
		});

		it('Should not find an invalid orphan', async () => {
			expect(await orphanService.findOne('invalid_id')).to.be.null;
		});
	});

	describe('update', () => {
		it('Should update the created orphan', async () => {
			const orphan = await createOrphan(orphanService, await OrphanFactory.buildCreateOrphanDto());
			const newOrphanData = await OrphanFactory.buildCreateOrphanDto();
			const updatedOrphan = await orphanService.update(orphan.id, newOrphanData);
			expect(orphan.id).to.be.eq(updatedOrphan.id);
			expect(updatedOrphan).containSubset({ ...newOrphanData, birthDate: new Date(newOrphanData.birthDate) });
		});

		it('Should not update an invalid orphan', async () => {
			await expect(
				orphanService.update('invalid_orphan', await OrphanFactory.buildCreateOrphanDto())
			).to.be.rejectedWith(NotFoundException);
		});

		it('Should upvote an orphan', async () => {
			let orphan = await createOrphan(orphanService, { ...(await OrphanFactory.buildCreateOrphanDto()), calm: 15 });
			const oldCalmScore = orphan.calm;
			let votedOrphan = await orphanService.vote(orphan.id, 'calm', 1);
			expect(votedOrphan.calm).to.be.eq(oldCalmScore + 1);

			// Should cap to 20
			orphan = await createOrphan(orphanService, { ...(await OrphanFactory.buildCreateOrphanDto()), calm: 20 });
			votedOrphan = await orphanService.vote(orphan.id, 'calm', 1);
			expect(votedOrphan.calm).to.be.eq(20);
		});

		it('Should downvote an orphan', async () => {
			let orphan = await createOrphan(orphanService, { ...(await OrphanFactory.buildCreateOrphanDto()), calm: 15 });
			const oldCalmScore = orphan.calm;
			let votedOrphan = await orphanService.vote(orphan.id, 'calm', -1);
			expect(votedOrphan.calm).to.be.eq(oldCalmScore - 1);

			// Should cap to 0
			orphan = await createOrphan(orphanService, { ...(await OrphanFactory.buildCreateOrphanDto()), calm: 0 });
			votedOrphan = await orphanService.vote(orphan.id, 'calm', -1);
			expect(votedOrphan.calm).to.be.eq(0);
		});
	});

	describe('remove', () => {
		it('Should delete the created orphan', async () => {
			const orphan = await createOrphan(orphanService, await OrphanFactory.buildCreateOrphanDto());
			await orphanService.remove(orphan.id);
			expect(await orphanService.findOne(orphan.id)).to.be.null;
		});

		it('Should not delete an invalid orphan', async () => {
			await expect(orphanService.remove('invalid_orphan')).to.be.rejectedWith(NotFoundException);
		});
	});
});
