import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import TestUtils, { getHttpClient } from './utils';
import chai, { expect } from 'chai';

import { Test } from '@nestjs/testing';
import User from '../src/core/user/entities/user.entity';
import { UserApiModule } from '../src/api/user-api/user-api.module';
import UserFactory from '../src/core/user/user.factory';
import { UserModule } from '../src/core/user/user.module';
import { UserService } from '../src/core/user/user.service';
import chaiSubset from 'chai-subset';

chai.use(chaiSubset);

const createdUsers: User[] = [];

describe('UserController (e2e)', function () {
	this.timeout(500000);

	let app: NestFastifyApplication;
	let userService: UserService;
	let users;

	this.beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [UserApiModule, UserModule]
		}).compile();
		app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
		app.useGlobalPipes(new ValidationPipe());

		await app.init();
		await app.getHttpAdapter().getInstance().ready();
		userService = app.get<UserService>(UserService);
		users = await TestUtils.createBasicAndAdminUsers(userService);
	});

	describe('As basic user', () => {
		it('Should be able to find himself (GET /users/:id)', async () => {
			const httpClient = await getHttpClient(app);
			let user = UserFactory.buildOne();
			let response = await httpClient.post('/users', user);
			user = response.json<User>();

			response = await httpClient.get(`/users/${response.json<User>().id}`);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<User>()).to.containSubset(user);
			createdUsers.push(user);
		});

		it('Should be able to update himself (UPDATE /users/:id)', async () => {
			const httpClient = await getHttpClient(app);
			let user = UserFactory.buildOne();
			let response = await httpClient.post('/users', user);
			user = response.json<User>();
			createdUsers.push(user);

			const newUserData = UserFactory.buildOne();
			response = await httpClient.patch(`/users/${user.id}`, newUserData);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<User>().email).to.be.eq(newUserData.email);
		});
	});

	describe('As admin user', () => {
		it('Should be able to retrieve user list (/users)', async () => {
			const httpClient = await getHttpClient(app);
			const response = await httpClient.get('/users');
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<User[]>()).to.be.instanceOf(Array);
			expect(response.json<User[]>().length).to.be.gt(0);
		});

		it('Should be able to create a user (POST /users)', async () => {
			const httpClient = await getHttpClient(app);
			const user = UserFactory.buildOne();
			const response = await httpClient.post('/users', user);
			expect(response.statusCode).to.be.eq(HttpStatus.CREATED);
			expect(response.json<User>().email).to.be.eq(user.email);
			createdUsers.push(response.json<User>());
		});

		it('Should not be able to create a user without email (POST /users)', async () => {
			const httpClient = await getHttpClient(app);
			const user = UserFactory.buildOne();
			delete user.email;
			const response = await httpClient.post('/users', user);
			expect(response.statusCode).to.be.eq(HttpStatus.BAD_REQUEST);
		});

		it('Should not be able to create a user with existing email (POST /users)', async () => {
			const httpClient = await getHttpClient(app);
			const user = UserFactory.buildOne();
			let response = await httpClient.post('/users', user);
			expect(response.statusCode).to.be.eq(HttpStatus.CREATED);
			createdUsers.push(response.json<User>());

			response = await httpClient.post('/users', { ...createdUsers[createdUsers.length - 1] });
			expect(response.statusCode).to.be.eq(HttpStatus.CONFLICT);
		});

		it('Should be able to update a user (PATCH /users/:id)', async () => {
			const httpClient = await getHttpClient(app);
			// Create a user
			const user = UserFactory.buildOne();
			let response = await httpClient.post('/users', { ...user });
			expect(response.statusCode).to.be.eq(HttpStatus.CREATED);
			createdUsers.push(response.json<User>());

			// Update it
			const newUserData = UserFactory.buildOne();
			response = await httpClient.patch(`/users/${createdUsers[createdUsers.length - 1].id}`, newUserData);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);
			expect(response.json<User>().email).to.be.eq(newUserData.email);
		});

		it('Should be able to delete a user (DELETE /users/:id)', async () => {
			const httpClient = await getHttpClient(app);
			// Create a user
			const user = UserFactory.buildOne();
			let response = await httpClient.post('/users', { ...user });
			expect(response.statusCode).to.be.eq(HttpStatus.CREATED);
			createdUsers.push(response.json<User>());

			// Delete it
			response = await httpClient.delete(`/users/${createdUsers[createdUsers.length - 1].id}`);
			expect(response.statusCode).to.be.eq(HttpStatus.OK);

			response = await httpClient.get(`/users/${createdUsers[createdUsers.length - 1].id}`);
			expect(response.statusCode).to.be.eq(HttpStatus.NOT_FOUND);
			createdUsers.pop();
		});
	});

	this.afterEach(async () => {
		const httpClient = await getHttpClient(app);
		for (const user of createdUsers) {
			await httpClient.delete(`/users/${user.id}`);
		}
		await httpClient.delete(`/users/${users.basic.id}`);
		await httpClient.delete(`/users/${users.admin.id}`);
	});
});
