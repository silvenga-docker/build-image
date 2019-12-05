import test from "ava";
import { expect, use } from "chai";
import { wait } from "../src/wait";

test.before(() => {
    use(require("chai-as-promised"));
});

test("throws invalid number", async () => {
    const input = parseInt("foo", 10);
    await expect(wait(input)).to.eventually.be.rejectedWith("milliseconds not a number");
});

test("wait 500 ms", async () => {
    const start = new Date();
    await wait(500);
    const end = new Date();
    let delta = Math.abs(end.getTime() - start.getTime());
    expect(delta).to.be.greaterThan(450);
});
