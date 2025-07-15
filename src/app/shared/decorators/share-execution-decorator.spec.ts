import { of } from "rxjs";
import { ShareExecution } from "./share-execution-decorator";
import { delay } from "rxjs/operators";

class TestClass {
  @ShareExecution()
  public testMethod() {
    return of("testMethod").pipe(delay(1000));
  }
}

describe(ShareExecution.name, () => {
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
