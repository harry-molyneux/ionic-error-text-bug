import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GridPage } from './grid.page';

import { GridVirtualScrollDirective } from '../scrolling/grid-virtual-scroll-strategy.directive';
import { VirtualScrollViewportResizeDirective } from '../scrolling/virtual-scroll-viewport-resize.directive';
import { GridPageRoutingModule } from './grid-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GridPageRoutingModule,
        ScrollingModule,
        GridVirtualScrollDirective,
        VirtualScrollViewportResizeDirective,
    ],
    declarations: [GridPage],
})
export class GridPageModule {}
