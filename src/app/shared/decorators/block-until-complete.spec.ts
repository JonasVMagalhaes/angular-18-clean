import { of } from "rxjs";
import { delay } from "rxjs/operators";
import { BlockUntilComplete } from "./block-until-complete";

class TestClass {
  @BlockUntilComplete()
  public testMethod() {
    return of("testMethod").pipe(delay(1000));
  }
}

describe(BlockUntilComplete.name, () => {
  it("Must be add execution to the class", () => {
    const testeClass = new TestClass();
    testeClass.testMethod()
      .subscribe((res) => {
        expect(res).toEqual("testMethod");
      });

    testeClass.testMethod()
      .subscribe((res) => {
        expect(res).toEqual("testMethod");
      });
  });
});
