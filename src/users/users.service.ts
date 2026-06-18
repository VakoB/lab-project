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

  // private users = [
  //   {
  //     id: 1,
  //     name: 'Leanne Graham',
  //     email: 'Sincere@april.biz',
  //   },
  //   {
  //     id: 2,
  //     name: 'Ervin Howell',
  //     email: 'Shanna@melissa.tv',
  //   },
  //   {
  //     id: 3,
  //     name: 'Clementine Bauch',
  //     email: 'Nathan@yesenia.net',
  //   },
  //   {
  //     id: 4,
  //     name: 'Patricia Lebsack',
  //     email: 'Julianne.OConner@kory.org',
  //   },
  //   {
  //     id: 5,
  //     name: 'Chelsey Dietrich',
  //     email: 'Lucio_Hettinger@annie.ca',
  //   },
  // ];
  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
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
