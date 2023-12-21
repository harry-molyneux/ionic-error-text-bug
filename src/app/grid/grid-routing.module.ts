import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GridPage } from './grid.page';

const routes: Routes = [
    {
        path: '',
        component: GridPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GridPageRoutingModule {}
