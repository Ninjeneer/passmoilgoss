import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Patch,
	Post,
	Query,
	UseInterceptors
} from '@nestjs/common';
import { OrphanService } from '../../core/orphan/orphan.service';
import {
	ApiBody,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger';
// import { TokenGuard } from '../../core/guards/token.guard';
import { CreateOrphanDto } from '../../core/orphan/dto/create-orphan.dto';
import { Gender, Orphan } from '../../core/orphan/entities/orphan.entity';
import { UpdateOrphanDto } from '../../core/orphan/dto/update-orphan.dto';

@Controller('orphans')
@ApiTags('Orphans')
//@UseGuards(RoleGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class OrphanController {
	constructor(private readonly orphanService: OrphanService) {}

	@Post()
	@ApiBody({ type: CreateOrphanDto })
	@ApiOperation({ summary: 'Create an orphan' })
	@ApiCreatedResponse({ description: 'Orphan created successfully', type: Orphan })
	create(@Body() createOrphanDto: CreateOrphanDto): Promise<Orphan> {
		return this.orphanService.create(createOrphanDto);
	}

	@Get()
	@ApiOperation({ summary: 'Retrieve all orphan' })
	@ApiOkResponse({ description: 'Successfully retrieved orphan list', type: [Orphan] })
	async findAll(
		@Query('gender') gender: string,
		@Query('countries') countries: string,
		@Query('eyes') eyes: string,
		@Query('hairs') hairs: string,
		@Query('firstname') firstname: string,
		@Query('sort') sort: string
	): Promise<Orphan[]> {
		return await this.orphanService.findAll(
			{
				gender: gender ? (gender === 'male' ? Gender.M : Gender.F) : undefined,
				countries: countries?.split('|'),
				eyes: eyes?.split('|'),
				hairs: hairs?.split('|'),
				firstname
			},
			sort && sort !== 'none' ? sort : undefined
		);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrieve an orphan' })
	@ApiOkResponse({ description: 'Successfully retrieved orphan', type: Orphan })
	@ApiNotFoundResponse({ description: 'Orphan does not exists' })
	async findOne(@Param('id') id: string): Promise<Orphan> {
		const orphan = await this.orphanService.findOne(id);
		if (!orphan) {
			throw new NotFoundException();
		}
		return orphan;
	}

	@Patch(':id')
	@ApiBody({ type: UpdateOrphanDto })
	@ApiOperation({ summary: 'Update an orphan' })
	@ApiOkResponse({ description: 'Successfully updated orphan', type: Orphan })
	async update(@Param('id') id: string, @Body() updateOrphanDto: UpdateOrphanDto): Promise<Orphan> {
		return await this.orphanService.update(id, updateOrphanDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete an orphan' })
	@ApiOkResponse({ description: 'Successfully deleted orphan', type: Orphan })
	@ApiNotFoundResponse({ description: 'Orphan does not exists' })
	async remove(@Param('id') id: string): Promise<void> {
		return await this.orphanService.remove(id);
	}

	@Patch(':id/:stat/upvote')
	@ApiOperation({ summary: 'Upvote an orphan' })
	@ApiOkResponse({ description: 'Successfully upvoted orphan', type: Orphan })
	@ApiNotFoundResponse({ description: 'Orphan does not exists' })
	async upvote(@Param('id') id: string, @Param('stat') stat: string): Promise<Orphan> {
		return await this.orphanService.vote(id, stat, 1);
	}

	@Patch(':id/:stat/downvote')
	@ApiOperation({ summary: 'Downvote an orphan' })
	@ApiOkResponse({ description: 'Successfully downvoted orphan', type: Orphan })
	@ApiNotFoundResponse({ description: 'Orphan does not exists' })
	async downvote(@Param('id') id: string, @Param('stat') stat: string): Promise<Orphan> {
		return await this.orphanService.vote(id, stat, -1);
	}
	@Get('countries')
	@ApiOperation({ summary: 'Get orphan countries' })
	@ApiOkResponse({ description: 'Successfully retrieved countries', type: [String] })
	async findCountries() {
		return await this.orphanService.findAvailableCountries();
	}
}
