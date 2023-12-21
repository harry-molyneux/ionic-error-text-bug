import { Component } from '@angular/core';

@Component({
    selector: 'app-list',
    templateUrl: 'list.page.html',
    styleUrls: ['list.page.scss'],
})
export class ListPage {
    items = Array.from({ length: 200 }).map((_, i) => {
        return {
            id: (++i).toString(),
        };
    });

    itemHeights: number[] = this.items.map((_i, index) => (index % 2 ? 50 : 100));

    trackById<T extends { id: string }>(_: number, value: T) {
        return value?.id;
    }
    compareById<T extends { id: string }>(value: T, other: T) {
        return value?.id === other?.id;
    }
}
