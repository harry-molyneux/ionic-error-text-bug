import { Component } from '@angular/core';

@Component({
    selector: 'app-grid',
    templateUrl: 'grid.page.html',
    styleUrls: ['grid.page.scss'],
})
export class GridPage {
    items = Array.from({ length: 200 }).map((_, i) => {
        return {
            id: (++i).toString(),
        };
    });

    itemHeights: number[] = this.items.map(() => 50);

    trackById<T extends { id: string }>(_: number, value: T) {
        return value?.id;
    }
    compareById<T extends { id: string }>(value: T, other: T) {
        return value?.id === other?.id;
    }
}
