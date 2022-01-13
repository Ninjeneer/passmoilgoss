import OrphanFactory from '../src/core/orphan/orphan.factory';
import { PrismaClient } from '@prisma/client';
import UserFactory from '../src/core/user/user.factory';

const prisma = new PrismaClient();

const n = 20;
(async function init() {
	prisma.orphan
		.createMany({
			data: await OrphanFactory.buildManyCreateOrphanDto(n)
		})
		.then((r) => console.log(`Created ${n} orphans`))
		.catch((e) => console.log(e));

	prisma.user
		.createMany({
			data: await UserFactory.buildMany(n)
		})
		.then((r) => console.log(`Created ${n} users`))
		.catch((e) => console.log(e));
})();
