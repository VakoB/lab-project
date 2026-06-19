import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  createUser(user: CreateUserDto) {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async updateUser(id: number, user: UpdateUserDto) {
    const existing = await this.usersRepository.findOneBy({ id });
    if (!existing) throw new NotFoundException(`User ${id} not found`);
    Object.assign(existing, user);
    return this.usersRepository.save(existing);
  }

  async deleteUser(id: number) {
    const existing = await this.usersRepository.findOneBy({ id });
    if (!existing) throw new NotFoundException(`User ${id} not found`);
    return this.usersRepository.remove(existing);
  }
}
