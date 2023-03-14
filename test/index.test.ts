import { strictEqual, deepStrictEqual } from "assert";
import { describe, test } from "mocha";
import { getAccounts, getDatabase, getValidator } from "@tableland/local";

describe("index", function () {
  this.timeout(25000);
  // Note that we're using the second account here
  const [, signer] = getAccounts();
  const sdk = getDatabase(signer);
  const validator = getValidator();

  test("create", async function () {
    const { meta } = await sdk
      .prepare("create table my_table (counter integer);")
      .all();
    strictEqual(meta.txn?.name, "my_table_31337_2");
  });

  test("insert", async function () {
    const { meta } = await sdk
      .prepare("insert into my_table_31337_2 values (1);")
      .all();
    const txnReceipt = await validator.receiptByTransactionHash({
      chainId: 31337,
      transactionHash: meta.txn?.transactionHash ?? "",
    });
    strictEqual(txnReceipt?.chainId, 31337);
  });

  test("update", async function () {
    const { meta } = await sdk
      .prepare("update my_table_31337_2 set counter=2;")
      .all();
    const txnReceipt = await validator.receiptByTransactionHash({
      chainId: 31337,
      transactionHash: meta.txn?.transactionHash ?? "",
    });
    strictEqual(txnReceipt?.chainId, 31337);
  });

  test("query", async function () {
    const { results } = await sdk
      .prepare("select * from my_table_31337_2;")
      .all();
    deepStrictEqual(results, [{ counter: 2 }]);
  });
});
