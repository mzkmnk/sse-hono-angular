import { MessagesService } from '@/app/messages.service';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-root',
	template: `
    <div class="h-screen w-screen">

      <div class="h-full w-full flex flex-col gap-2 overflow-y-scroll p-5">
        @for(message of messages(); let i = $index; track i){
          <div
            class="flex gap-2 items-center"
            [class]="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            @if(message.role === 'assistant'){
              <img src="assistant.jpg" class="w-10 h-10 rounded-full border border-slate-700 self-end" alt="user" />
            }
            <div
              class="border border-gray-300 rounded-xl p-3 max-w-3/4"
            >
              <p>{{message.content}}</p>
            </div>
            @if(message.role === 'user'){
              <img src="user.png" class="w-10 h-10 rounded-full border border-slate-700 self-end" alt="user" />
            }
          </div>
        }
      </div>

      <!-- メッセージフォーム -->
      <div class="bg-white flex flex-col fixed inset-x-10 bottom-10 h-25 outline-1 outline-gray-300 rounded-xl focus-within:outline-1 focus-within:outline-blue-600">
        <textarea [(ngModel)]="userMessage" class="h-full resize-none w-full rounded-xl outline-none p-2" placeholder="入力してください。"></textarea>
        <button (click)="submit()" class="cursor-pointer rounded-lg px-2 py-1 inline-flex items-center self-end text-white bg-blue-700 hover:bg-blue-600 transition mr-2 mb-2" type="button">送信</button>
      </div>
    </div>
  `,
	imports: [FormsModule],
})
export class AppComponent {
	userMessage = signal<string>('');

	private readonly messageService = inject(MessagesService);

	messages = this.messageService.messages;

	submit(): void {
		if (this.userMessage() === '') return;

		this.messageService.submit(this.userMessage());
		this.userMessage.set('');
	}
}
