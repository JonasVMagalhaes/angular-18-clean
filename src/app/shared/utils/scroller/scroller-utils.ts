export class Scroll {
  private static scroller: Scroll = new Scroll();

  private horizontal(childElement: HTMLElement, parentElement: HTMLElement, behavior: 'auto' | 'smooth' | 'instant'): void {
    const childElementRect: any = childElement.getBoundingClientRect();
    const childElementWidth: number = childElementRect.width;
    const windowWidth: number = window.innerWidth;

    const scrollPosition: number = childElementRect.left - (windowWidth / 2) + (childElementWidth / 2);

    parentElement?.scrollTo({
      left: scrollPosition,
      behavior: behavior
    });
  }

  static scrollerHorizontalAuto(childElement: HTMLElement, parentElement: HTMLElement): void {
    this.scroller.horizontal(childElement, parentElement, "auto");
  }

  static scrollerHorizontalSmooth(childElement: HTMLElement, parentElement: HTMLElement): void {
    console.log(childElement.getBoundingClientRect());
    this.scroller.horizontal(childElement, parentElement as HTMLElement, "smooth");
  }

  static scrollerHorizontalInstant(childElement: HTMLElement, parentElement: HTMLElement): void {
    this.scroller.horizontal(childElement, parentElement, "instant");
  }

  static scrollerHorizontalInstantToEnd(parentElement: HTMLElement): void {
    parentElement?.scrollTo({
      left: 1_000_000,
      behavior: 'instant'
    });
  }

  static scrollerHorizontalInstantToStart(parentElement: HTMLElement): void {
    parentElement?.scrollTo({
      left: 0,
      behavior: 'instant'
    });
  }
}
