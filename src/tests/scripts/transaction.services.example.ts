import { TransactionService } from '../../services/transaction.service';

async function main() {
  const transactionService = new TransactionService();
  const result = await transactionService.testRollback(
    'cmr3ldr9d000ccgv5v5dy45w9',
    'some random title',
  );
  console.log(result); // should return null
}

main().catch((error) => {
  console.log(error);
  process.exit();
});
