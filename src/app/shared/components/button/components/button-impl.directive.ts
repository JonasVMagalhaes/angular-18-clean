import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive()
export class ButtonBaseDirective implements AfterViewInit {
    protected readonly classButton: string = 'app-button';

    constructor(private readonly elementRef: ElementRef,
                private readonly renderer: Renderer2
    ) { }

    ngAfterViewInit(): void {
        this.setAttribute();
    }

    private setAttribute() {
        const button = this.elementRef.nativeElement.querySelector("button");
        this.renderer.addClass(button, this.classButton);
    }
}
