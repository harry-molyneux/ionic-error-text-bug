import {Component} from '@angular/core';
import {
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-form',
    templateUrl: 'form.page.html',
    standalone: true,
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonList,
        IonItem,
        IonInput,
        FormsModule,
        IonButton,
        IonIcon,
    ],
})
export class FormPage {
    shortErrorText: string = '';
    longErrorText: string = '';
}
