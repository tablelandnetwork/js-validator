import { strictEqual, deepStrictEqual } from "assert";
import { describe, test } from "mocha";
import { getAccounts, getConnection } from "@tableland/local";

describe("index", function () {
  // Note that we're using the second account here
  const [, signer] = getAccounts();
  const sdk = getConnection(signer);

  test("create", async function () {
    const { name } = await sdk.create("counter integer", { prefix: "table" });
    strictEqual(name, "table_31337_2");
  });

  test("insert", async function () {
    const { hash } = await sdk.write("insert into table_31337_2 values (1);");
    const txnReceipt = await sdk.receipt(hash);
    strictEqual(txnReceipt?.chainId, 31337);
  });

  test("update", async function () {
    const { hash } = await sdk.write("update table_31337_2 set counter=2;");
    const txnReceipt = await sdk.receipt(hash);
    strictEqual(txnReceipt?.chainId, 31337);
  });

  test("query", async function () {
    const { rows } = await sdk.read("select * from table_31337_2;");
    deepStrictEqual(rows[0], [2]);
  });
});
