import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./global.styles.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  user: any;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
) {}

  ngOnInit(): void {
    // Need to prevent errors in SSR
    if (isPlatformBrowser(this.platformId)) {
        const userString = localStorage.getItem('user');
        if (userString) {
          this.user = JSON.parse(userString);
        }
    }
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  navigateToSignin(): void {
    this.router.navigate(['/signin']);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) { // Good practice to check here too
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.user = null;
        // Optional: Redirect to signin or home page after logout
        // this.router.navigate(['/']);
    }
  }
}