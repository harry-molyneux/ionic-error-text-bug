import { ListRange } from '@angular/cdk/collections';
import {
    CdkVirtualScrollViewport,
    VIRTUAL_SCROLL_STRATEGY,
    VirtualScrollStrategy,
} from '@angular/cdk/scrolling';
import {
    ChangeDetectorRef,
    Directive,
    Input,
    OnChanges,
    SimpleChanges,
    forwardRef,
} from '@angular/core';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export type ItemHeight = number[];
type Range = [number, number];

export class FixedItemHeightsVirtualScrollStrategy implements VirtualScrollStrategy {
    private readonly BUFFER_BEFORE = 5;
    private readonly BUFFER_AFTER = 5;
    private totalContentSizeCache: number | null = null;
    private cumulativeOffsets: number[] = [];
    private viewport?: CdkVirtualScrollViewport;
    private scrolledIndexChange$ = new Subject<number>();
    public scrolledIndexChange: Observable<number> = this.scrolledIndexChange$.pipe(
        distinctUntilChanged()
    );

    constructor(private itemHeights: ItemHeight) {
        this.precomputeCumulativeOffsets();
    }

    public updateItemHeights(itemHeights: ItemHeight) {
        this.itemHeights = itemHeights;

        // Recompute the cumulative offsets whenever the item heights are updated
        this.precomputeCumulativeOffsets();

        this.totalContentSizeCache = null;

        this.updateTotalContentSize();
        this.updateRenderedRange();
    }

    attach(viewport: CdkVirtualScrollViewport) {
        this.viewport = viewport;
        this.updateTotalContentSize();
        this.updateRenderedRange();
    }

    detach() {
        this.scrolledIndexChange$.complete();
        delete this.viewport;
    }

    onContentScrolled() {
        this.updateRenderedRange();
    }

    onDataLengthChanged() {
        this.updateTotalContentSize();
        this.updateRenderedRange();
    }

    onContentRendered = noop;

    onRenderedOffsetChanged = noop;

    scrollToIndex(index: number, behavior: ScrollBehavior) {
        this.viewport?.scrollToOffset(this.getItemOffset(index), behavior);
    }

    private precomputeCumulativeOffsets(): void {
        this.cumulativeOffsets = this.itemHeights.reduce((acc, currentHeight, index) => {
            if (index === 0) {
                acc.push(currentHeight);
            } else {
                acc.push(acc[index - 1] + currentHeight);
            }
            return acc;
        }, [] as number[]);
    }

    private getItemOffset(index: number): number {
        return index === 0 ? 0 : this.cumulativeOffsets[index - 1];
    }

    private getTotalContentSize(): number {
        // Check if the total content size is already calculated and stored
        if (this.totalContentSizeCache !== null) {
            return this.totalContentSizeCache;
        }

        // If not in cache, calculate the total content size
        this.totalContentSizeCache = this.itemHeights.reduce((a, b) => a + b, 0);

        return this.totalContentSizeCache;
    }

    private getListRangeAt(scrollOffset: number, viewportSize: number): ListRange {
        type Acc = { itemIndexesInRange: number[]; currentOffset: number };
        const visibleOffsetRange: Range = [scrollOffset, scrollOffset + viewportSize];
        const itemsInRange = this.itemHeights.reduce<Acc>(
            (acc, itemHeight, index) => {
                const itemOffsetRange: Range = [acc.currentOffset, acc.currentOffset + itemHeight];
                return {
                    currentOffset: acc.currentOffset + itemHeight,
                    itemIndexesInRange: this.intersects(itemOffsetRange, visibleOffsetRange)
                        ? [...acc.itemIndexesInRange, index]
                        : acc.itemIndexesInRange,
                };
            },
            { itemIndexesInRange: [], currentOffset: 0 }
        ).itemIndexesInRange;
        return {
            start: this.clamp(
                0,
                (itemsInRange[0] ?? 0) - this.BUFFER_BEFORE,
                this.itemHeights.length - 1
            ),
            end: this.clamp(
                0,
                (itemsInRange[itemsInRange.length - 1] ?? 0) + this.BUFFER_AFTER,
                this.itemHeights.length
            ),
        };
    }

    private updateRenderedRange() {
        if (!this.viewport) return;

        const viewportSize = this.viewport.getViewportSize();
        const scrollOffset = this.viewport.measureScrollOffset();
        const newRange = this.getListRangeAt(scrollOffset, viewportSize);
        const oldRange = this.viewport?.getRenderedRange();

        if (isEqual(newRange, oldRange)) return;

        this.viewport.setRenderedRange(newRange);
        this.viewport.setRenderedContentOffset(this.getItemOffset(newRange.start));
        this.scrolledIndexChange$.next(newRange.start);
    }

    private updateTotalContentSize() {
        const contentSize = this.getTotalContentSize();
        this.viewport?.setTotalContentSize(contentSize);
    }

    private clamp(min: number, value: number, max: number) {
        return Math.min(Math.max(min, value), max);
    }

    private intersects(a: Range, b: Range): boolean {
        return (
            (a[0] <= b[0] && b[0] <= a[1]) ||
            (a[0] <= b[1] && b[1] <= a[1]) ||
            (b[0] < a[0] && a[1] < b[1])
        );
    }
}

function factory(dir: FixedItemHeightsVirtualScrollDirective) {
    return dir.scrollStrategy;
}

@Directive({
    selector: 'cdk-virtual-scroll-viewport[fixedItemHeightsVirtualScrollStrategy]',
    providers: [
        {
            provide: VIRTUAL_SCROLL_STRATEGY,
            useFactory: factory,
            deps: [forwardRef(() => FixedItemHeightsVirtualScrollDirective)],
        },
    ],
    standalone: true,
})
export class FixedItemHeightsVirtualScrollDirective implements OnChanges {
    @Input({ required: true }) itemHeights: ItemHeight = [];

    scrollStrategy: FixedItemHeightsVirtualScrollStrategy =
        new FixedItemHeightsVirtualScrollStrategy(this.itemHeights);

    constructor(private cd: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges) {
        if ('itemHeights' in changes) {
            const prevItemHeights = changes['itemHeights'].previousValue as ItemHeight;
            const currItemHeights = changes['itemHeights'].currentValue as ItemHeight;

            // Check if itemHeights have actually changed
            if (!isEqual(prevItemHeights, currItemHeights)) {
                this.scrollStrategy.updateItemHeights(this.itemHeights);
                this.cd.detectChanges();
            }
        }
    }
}
