import { after, before } from "mocha";
import { LocalTableland } from "@tableland/local";

const lt = new LocalTableland({ silent: false, verbose: true });

before(async function () {
  this.timeout(25000);
  await lt.start();
});

after(async function () {
  this.timeout(25000);
  await lt.shutdown();
});
