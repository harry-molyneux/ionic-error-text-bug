import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'list',
        loadChildren: () => import('./list/list.module').then((m) => m.ListPageModule),
    },
    {
        path: 'grid',
        loadChildren: () => import('./grid/grid.module').then((m) => m.GridPageModule),
    },
    {
        path: 'form',
        loadComponent: () => import('./form/form.page').then((m) => m.FormPage),
    },
    {
        path: '**',
        redirectTo: 'form',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
