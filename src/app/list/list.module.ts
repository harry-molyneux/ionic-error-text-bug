import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ListPage } from './list.page';

import { VirtualScrollerModule } from '@iharbeck/ngx-virtual-scroller';
import { FixedItemHeightsVirtualScrollDirective } from '../scrolling/fixed-item-heights-virtual-scroll-strategy.directive';
import { VirtualScrollViewportResizeDirective } from '../scrolling/virtual-scroll-viewport-resize.directive';
import { ListPageRoutingModule } from './list-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ListPageRoutingModule,
        ScrollingModule,
        FixedItemHeightsVirtualScrollDirective,
        VirtualScrollViewportResizeDirective,
        VirtualScrollerModule,
    ],
    declarations: [ListPage],
})
export class ListPageModule {}
