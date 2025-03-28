import { Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { HomeComponent } from './home.component';
//import { JobOffersTableComponent } from './job-offers-table.component';

export const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'home', component: HomeComponent},
  //{ path: 'dashboard', component: JobOffersTableComponent},
  // Add other routes here
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];