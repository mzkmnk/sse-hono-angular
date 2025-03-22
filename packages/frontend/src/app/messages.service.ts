import {environment} from '@/environments/environment';
import {computed, Injectable, type Signal, signal, type WritableSignal,} from '@angular/core';

type Message = {
	role: 'user' | 'assistant';
	content: string;
};

@Injectable({
	providedIn: 'root',
})
export class MessagesService {
	private _messageCnt = 0;

	private _isProcessing = false;

	private _messages: WritableSignal<Message[]> = signal<Message[]>([]);

	messages: Signal<Message[]> = computed((): Message[] => this._messages());

	submit(message: string): void {
		this._messageCnt++;

		this._messages.update((dt) => [...dt, { role: 'user', content: message }]);

		this.eventSetup(message);
	}

	eventSetup(message: string): void {
		const eventSource: EventSource = new EventSource(
			`${environment.apiUrl}/stream/messages/${message}`,
		);

		eventSource.onmessage = (ev: MessageEvent<string>): void => {
			if (!this._isProcessing) {
				this._messageCnt++;
				this._messages.update((dt) => [
					...dt,
					{
						role: 'assistant',
						content: '',
					},
				]);

				this._isProcessing = true;
			}

			this._messages.update((dt) => {
				dt[this._messageCnt - 1].content += ev.data.trim();
				return [...dt];
			});
		};

		eventSource.onerror = (): void => {
			this._isProcessing = false;
			eventSource.close();
		};
	}
}
