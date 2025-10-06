// services/message.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
// import { ToastrService } from 'ngx-toastr';

export interface Message {
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageSubject = new BehaviorSubject<Message | null>(null);

  public message$: Observable<Message | null> = this.messageSubject.asObservable();

  constructor(
    // private toastr: ToastrService
  ) {}

  showMessage(text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration?: number): void {
    const message: Message = { text, type, duration };
    this.messageSubject.next(message);

    // Optional: Integrate with toastr
    // this.showToastr(message);
  }

  showSuccess(text: string, duration?: number): void {
    this.showMessage(text, 'success', duration);
  }

  showError(text: string, duration?: number): void {
    this.showMessage(text, 'error', duration);
  }

  showInfo(text: string, duration?: number): void {
    this.showMessage(text, 'info', duration);
  }

  showWarning(text: string, duration?: number): void {
    this.showMessage(text, 'warning', duration);
  }

  clearMessage(): void {
    this.messageSubject.next(null);
  }

  // Private method for toastr integration
  private showToastr(message: Message): void {
    // Uncomment if using toastr
    /*
    switch (message.type) {
      case 'success':
        this.toastr.success(message.text, 'Success');
        break;
      case 'error':
        this.toastr.error(message.text, 'Error');
        break;
      case 'info':
        this.toastr.info(message.text, 'Info');
        break;
      case 'warning':
        this.toastr.warning(message.text, 'Warning');
        break;
    }
    */
  }
}