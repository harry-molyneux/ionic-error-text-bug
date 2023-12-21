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
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export class GridVirtualScrollStrategy implements VirtualScrollStrategy {
    private totalContentSizeCache: number | null = null;
    private viewport?: CdkVirtualScrollViewport;
    private scrolledIndexChange$ = new Subject<number>();
    public scrolledIndexChange: Observable<number> = this.scrolledIndexChange$.pipe(
        distinctUntilChanged()
    );

    constructor(private itemSize: number, private columns = 1) {}

    public updateItemAndBufferSize(itemSize: number, columns: number) {
        this.itemSize = itemSize;
        this.columns = columns;

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

    onContentRendered() {}

    onRenderedOffsetChanged() {}

    scrollToIndex(index: number, behavior: ScrollBehavior) {
        this.viewport?.scrollToOffset(this.getItemOffset(index), behavior);
    }

    private getItemOffset(index: number): number {
        const rowIndex = Math.floor(index / this.columns);
        return rowIndex * this.itemSize;
    }

    private getTotalContentSize(): number {
        // Check if the total content size is already calculated and stored
        if (this.totalContentSizeCache !== null) {
            return this.totalContentSizeCache;
        }

        // If not in cache, calculate the total content size
        const numberOfRows = Math.ceil(this.dataLength / this.columns);

        return numberOfRows * this.itemSize;
    }

    private getListRangeAt(scrollOffset: number, viewportSize: number): ListRange {
        const startRow = Math.floor(scrollOffset / this.itemSize);
        const endRow = Math.ceil((scrollOffset + viewportSize) / this.itemSize);

        const startColumn = 0;
        const endColumn = this.columns - 1;

        const start = startRow * this.columns + startColumn;
        const end = endRow * this.columns + endColumn;

        return {
            start: Math.max(0, start - this.columns),
            end: Math.min(this.dataLength, end + this.columns),
        };
    }

    private updateRenderedRange() {
        if (!this.viewport) return;

        const viewportSize = this.viewport.getViewportSize();
        const scrollOffset = this.viewport.measureScrollOffset();
        const newRange = this.getListRangeAt(scrollOffset, viewportSize);
        const oldRange = this.viewport?.getRenderedRange();

        console.log('newRange', newRange);

        if (isEqual(newRange, oldRange)) return;

        this.viewport.setRenderedRange(newRange);
        this.viewport.setRenderedContentOffset(this.getItemOffset(newRange.start));
        this.scrolledIndexChange$.next(newRange.start);
    }

    private updateTotalContentSize() {
        const contentSize = this.getTotalContentSize();
        this.viewport?.setTotalContentSize(contentSize);
    }

    private get dataLength() {
        return this.viewport?.getDataLength() ?? 0;
    }
}

function factory(dir: GridVirtualScrollDirective) {
    return dir.scrollStrategy;
}

@Directive({
    selector: 'cdk-virtual-scroll-viewport[gridVirtualScrollStrategy]',
    providers: [
        {
            provide: VIRTUAL_SCROLL_STRATEGY,
            useFactory: factory,
            deps: [forwardRef(() => GridVirtualScrollDirective)],
        },
    ],
    standalone: true,
})
export class GridVirtualScrollDirective implements OnChanges {
    @Input({ required: true }) itemSize = 20;
    @Input({ required: true }) columns = 1;

    scrollStrategy: GridVirtualScrollStrategy = new GridVirtualScrollStrategy(
        this.itemSize,
        this.columns
    );

    constructor(private cd: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges) {
        if ('itemSize' in changes) {
            const prevItemSize = changes['itemSize'].previousValue as number;
            const currItemSize = changes['itemSize'].currentValue as number;

            // Check if itemSize has actually changed
            if (!isEqual(prevItemSize, currItemSize)) {
                this.scrollStrategy.updateItemAndBufferSize(this.itemSize, this.columns);
                this.cd.detectChanges();
            }
        } else if ('columns' in changes) {
            const prevColumns = changes['columns'].previousValue as number;
            const currColumns = changes['columns'].currentValue as number;

            // Check if columns have actually changed
            if (!isEqual(prevColumns, currColumns)) {
                this.scrollStrategy.updateItemAndBufferSize(this.itemSize, this.columns);
                this.cd.detectChanges();
            }
        }
    }
}
