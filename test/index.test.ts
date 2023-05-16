import { strictEqual, deepStrictEqual } from "assert";
import { describe, test } from "mocha";
import { getAccounts, getDatabase, getValidator } from "@tableland/local";

describe("index", function () {
  this.timeout(45000);
  // Note that we're using the second account here
  const [, signer] = getAccounts();
  const sdk = getDatabase(signer);
  const validator = getValidator();

  test("create one", async function () {
    const { meta } = await sdk
      .prepare("create table my_table (counter integer);")
      .all();
    strictEqual(meta.txn?.name, "my_table_31337_2");
  });

  // TODO: need to wait until the new sdk is available on npm
  test("create batch", async function () {
    const [{ meta }] = await sdk.batch([
      sdk.prepare("create table my_table (counter integer);"),
      sdk.prepare("create table my_other_table (name text);"),
    ]);

    deepStrictEqual(meta.txn?.names, [
      "my_table_31337_3",
      "my_other_table_31337_4",
    ]);
    deepStrictEqual(meta.txn?.tableIds, ["3", "4"]);
  });

  test("insert one", async function () {
    const { meta } = await sdk
      .prepare("insert into my_table_31337_2 values (1);")
      .all();
    const txnReceipt = await validator.receiptByTransactionHash({
      chainId: 31337,
      transactionHash: meta.txn?.transactionHash ?? "",
    });

    strictEqual(txnReceipt?.chainId, 31337);
  });

  // TODO: need to wait until the new sdk is available on npm
  test("insert batch", async function () {
    const [{ meta }] = await sdk.batch([
      sdk.prepare("insert into my_table_31337_3 values (1);"),
      sdk.prepare("insert into my_other_table_31337_4 values ('my test');"),
    ]);

    const txnReceipt = await validator.receiptByTransactionHash({
      chainId: 31337,
      transactionHash: meta.txn?.transactionHash ?? "",
    });

    strictEqual(txnReceipt?.chainId, 31337);
    deepStrictEqual(meta.txn?.tableIds, ["3", "4"]);
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
