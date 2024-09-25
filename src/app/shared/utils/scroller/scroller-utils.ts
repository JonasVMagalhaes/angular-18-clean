export class Scroll {
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
    const scroller: Scroll = new Scroll();
    scroller.horizontal(childElement, parentElement, "auto");
  }

  static scrollerHorizontalSmooth(childElement: HTMLElement, parentElement: HTMLElement): void {
    const scroller: Scroll = new Scroll();
    scroller.horizontal(childElement, parentElement, "smooth");
  }

  static scrollerVerticalInstant(childElement: HTMLElement, parentElement: HTMLElement): void {
    const scroller: Scroll = new Scroll();
    scroller.horizontal(childElement, parentElement, "instant");
  }
}
