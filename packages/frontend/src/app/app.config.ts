import { provideHttpClient } from '@angular/common/http';
import {
	type ApplicationConfig,
	provideZoneChangeDetection,
} from '@angular/core';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideHttpClient(),
	],
};
