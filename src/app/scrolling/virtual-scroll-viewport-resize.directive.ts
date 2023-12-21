import { Subject, Subscription, throttleTime } from 'rxjs';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Directive, Inject, OnDestroy, Self } from '@angular/core';

@Directive({
    selector: '[virtualScrollViewportResize], virtual-scroll-viewport-resize',
    standalone: true,
})
export class VirtualScrollViewportResizeDirective implements OnDestroy {
    private resized$ = new Subject<void>();
    private resizeObserver = new ResizeObserver(() => this.resized$.next());
    private resizeSubscription: Subscription;

    constructor(
        @Self()
        @Inject(CdkVirtualScrollViewport)
        _viewport: CdkVirtualScrollViewport
    ) {
        this.resizeSubscription = this.resized$
            .pipe(throttleTime(20, undefined, { leading: true, trailing: true }))
            .subscribe(() => _viewport.checkViewportSize());
        this.resizeObserver.observe(_viewport.elementRef.nativeElement);
    }

    ngOnDestroy() {
        this.resizeSubscription?.unsubscribe();
        this.resizeObserver.disconnect();
    }
}
