import OrphanFactory from '../src/core/orphan/orphan.factory';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const n = 20;
(async function init() {
	prisma.orphan
		.createMany({
			data: await OrphanFactory.buildManyCreateOrphanDto(n)
		})
		.then((r) => console.log(`Created ${n} orphans`))
		.catch((e) => console.log(e));
})();
