import { FormControl } from '@angular/forms';


export function ValidateLatLong(control: FormControl) {
    const y = isNaN(control.value);
    const x = control.value ? control.value.toString().split('.')[1] ? control.value.toString().split('.')[1].length : 0 : 0;
    if (x < 4 || y) {
        if (y) {
            return {
                invalidNumber: true
            };
        } else {
            return {
                invalidLatLong: true
            };
        }
    } else {
        return null;
    }
}

export function ValidateKiosk(control: FormControl) {
    const x = control.value.toString().indexOf('.');
    if (x !== -1) {
        return {
            invalidNoKiosk: true
        };
    } else {
        return null;
    }
}
