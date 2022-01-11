import 'mocha';

import { Test, TestingModule } from '@nestjs/testing';
import chai, { expect } from 'chai';

import { NotFoundException } from '@nestjs/common';
import { Orphan } from './entities/orphan.entity';
import OrphanFactory from './orphan.factory';
import OrphanRepository from './orphan.repository';
import { OrphanService } from './orphan.service';
import { PrismaService } from '../../prisma.service';
import { SecurityModule } from '../security/security.module';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';

chai.use(chaiSubset);
chai.use(chaiAsPromised);

const createdOrphans: Orphan[] = [];

async function createOrphan(orphanService: OrphanService) {
	const orphan = OrphanFactory.buildCreateOrphanDto();
	const createdOrphan = await orphanService.create(orphan);
	expect(createdOrphan).containSubset({ ...orphan, birthDate: new Date(orphan.birthDate) });
	createdOrphans.push(createdOrphan);
	return createdOrphan;
}

describe('OrphanService', () => {
	let orphanService: OrphanService;
	let module: TestingModule;

	beforeEach(async () => {
		module = await Test.createTestingModule({
			imports: [SecurityModule],
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
		//await module.get(PrismaService).$disconnect();
		await module.close();
	});
	it('should be defined', () => {
		expect(orphanService).to.not.be.null;
	});

	describe('findAll', () => {
		it('Should return an array of orphans', async () => {
			const o1 = await createOrphan(orphanService);
			const o2 = await createOrphan(orphanService);
			const orphans = await orphanService.findAll();
			expect(orphans).to.include.deep.members([o1, o2]);
		});
	});

	describe('create', () => {
		it('Should create a orphan', async () => {
			await createOrphan(orphanService);
		});
	});

	describe('find', () => {
		it('Should find the created orphan', async () => {
			const orphan = await createOrphan(orphanService);
			expect(await orphanService.findOne(orphan.id)).containSubset(orphan);
		});

		it('Should not find an invalid orphan', async () => {
			expect(await orphanService.findOne('invalid_id')).to.be.null;
		});
	});

	describe('update', () => {
		it('Should update the created orphan', async () => {
			const orphan = await createOrphan(orphanService);
			const newOrphanData = OrphanFactory.buildCreateOrphanDto();
			const updatedOrphan = await orphanService.update(orphan.id, newOrphanData);
			expect(orphan.id).to.be.eq(updatedOrphan.id);
			expect(updatedOrphan).containSubset({ ...newOrphanData, birthDate: new Date(newOrphanData.birthDate) });
		});

		it('Should not update an invalid orphan', async () => {
			await expect(orphanService.update('invalid_orphan', OrphanFactory.buildCreateOrphanDto())).to.be.rejectedWith(
				NotFoundException
			);
		});
	});

	describe('remove', () => {
		it('Should delete the created orphan', async () => {
			const orphan = await createOrphan(orphanService);
			await orphanService.remove(orphan.id);
			expect(await orphanService.findOne(orphan.id)).to.be.null;
		});

		it('Should not delete an invalid orphan', async () => {
			await expect(orphanService.remove('invalid_orphan')).to.be.rejectedWith(NotFoundException);
		});
	});
});
