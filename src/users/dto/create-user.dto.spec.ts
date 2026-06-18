import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateUserDto();

    dto.name = 'vako';
    dto.email = 'vako@gmail.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not pass validation with invalid data', async () => {
    const dto = new CreateUserDto();

    dto.name = 'vako';
    dto.email = 'invalid email';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
