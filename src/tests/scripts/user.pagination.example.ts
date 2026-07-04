import { UserService } from '../../services/user.service';

async function main() {
  const userService = new UserService();

  const page1 = await userService.listAllPaginated(3);

  console.log('Page 1 data:', page1.data);
  console.log('Next cursor:', page1.nextCursor);

  const page2 = await userService.listAllPaginated(3, page1.nextCursor!);

  console.log('Page 2 count:', page2.data);
}

main().catch((error) => {
  console.log(error);
  process.exit();
});
