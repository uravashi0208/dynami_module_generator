import { enableProdMode, importProvidersFrom, inject } from '@angular/core';
import { provideApollo } from 'apollo-angular';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { InMemoryCache } from '@apollo/client/core';

if (environment.production) {
  enableProdMode();
  //show this warning only on prod mode
  if (window) {
    selfXSSWarning();
  }
}

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(BrowserModule, AppRoutingModule), provideAnimations()],
}).catch((err) => console.error(err));

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule),
    provideAnimations(),
    provideHttpClient(),
    provideAnimations(),
    // ✅ Apollo provider
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const authLink = setContext((operation, context) => {
        const token = localStorage.getItem('auth_token');
        return {
          headers: {
            ...(context['headers'] || {}),
            Authorization: token ? `Bearer ${token}` : '',
          },
        };
      });

      return {
        cache: new InMemoryCache(),
        link: authLink.concat(
          httpLink.create({ uri: 'https://dynami-module-generator.onrender.com/graphql' })
        ),
      };
    }),
  ],
}).catch((err) => console.error(err));

function selfXSSWarning() {
  setTimeout(() => {
    console.log(
      '%c** STOP **',
      'font-weight:bold; font: 2.5em Arial; color: white; background-color: #e11d48; padding-left: 15px; padding-right: 15px; border-radius: 25px; padding-top: 5px; padding-bottom: 5px;',
    );
    console.log(
      `\n%cThis is a browser feature intended for developers. Using this console may allow attackers to impersonate you and steal your information sing an attack called Self-XSS. Do not enter or paste code that you do not understand.`,
      'font-weight:bold; font: 2em Arial; color: #e11d48;',
    );
  });
}
