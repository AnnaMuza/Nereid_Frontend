import { Subject } from 'rxjs';
import { ToastMessageOptions } from 'primevue/toast';

class ToastsService {

    public globalToasts: Subject<ToastMessageOptions> = new Subject<ToastMessageOptions>();

}

export default new ToastsService();
