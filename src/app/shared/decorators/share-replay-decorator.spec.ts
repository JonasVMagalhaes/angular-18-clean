import { of } from "rxjs";
import { delay } from "rxjs/operators";
import { ShareReplay } from "./share-replay-decorator";

class TestClass {
  @ShareReplay()
  public testMethod() {
    return of("testMethod").pipe(delay(1000));
  }
}

describe(ShareReplay.name, () => {
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
