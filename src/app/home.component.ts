// home.component.ts

import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
// Import CommonModule AND HttpClientModule for standalone component
import { CommonModule, isPlatformBrowser, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClient & Module
import { Subscription } from 'rxjs'; // To manage HTTP subscription
import { finalize } from 'rxjs/operators'; // To handle completion

// --- Interface based on the Mongoose Schema ---
// Assuming the backend transform maps _id to id, or we might need a backend change.
// If 'id' isn't returned, you might need to use the index or request backend adjustment.
export interface JobOffer {
  _id: string; // Assuming _id is transformed to id
  userId: string; // May or may not be returned in the list, but good to have
  jobTitle: string;
  companyName: string;
  location: string;
  salary: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string | Date; // Keep as string or Date depending on API response
  updatedAt: string | Date;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./global.styles.scss'],
  standalone: true,
  // Add HttpClientModule and Pipes here for standalone components
  imports: [CommonModule, HttpClientModule, CurrencyPipe, DatePipe]
})
export class HomeComponent implements OnInit, OnDestroy {
  user: any;
  jobOffers: JobOffer[] = [];
  isLoadingJobs = false;
  jobFetchError: string | null = null;
  private jobSubscription: Subscription | null = null; // To unsubscribe

  constructor(
    private router: Router,
    private http: HttpClient, // Inject HttpClient
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    // Need to prevent errors in SSR
    if (isPlatformBrowser(this.platformId)) {
        const userString = localStorage.getItem('user');
        if (userString) {
          try {
            this.user = JSON.parse(userString);
            // Fetch jobs ONLY if user is loaded successfully
            if (this.user && this.user._id) { // Ensure user and user._id exist
               this.fetchJobOffers(this.user._id);
            } else {
                console.error("User data loaded from localStorage is missing _id.");
                this.logout();
            }
          } catch (error) {
              console.error("Error parsing user data from localStorage:", error);
              this.logout();
          }
        }
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from HTTP request if component is destroyed
    this.jobSubscription?.unsubscribe();
  }

  fetchJobOffers(userId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Don't fetch on server
    }

    this.isLoadingJobs = true;
    this.jobFetchError = null;
    this.jobOffers = []; // Clear previous offers

    const apiUrl = `http://localhost:8000/jobs/${userId}`; // Use http, adjust if needed

    this.jobSubscription = this.http.get<JobOffer[]>(apiUrl)
      .pipe(
        finalize(() => {
          this.isLoadingJobs = false; // Stop loading indicator
        })
      )
      .subscribe({
        next: (offers) => {
          console.log(offers);
          this.jobOffers = offers;
        },
        error: (error) => {
          console.error('Error fetching job offers:', error);
          this.jobFetchError = 'Failed to load job offers. Please try again later.';
        }
      });
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
        this.jobOffers = []; // Clear job offers
        this.jobFetchError = null; // Clear any errors
        this.jobSubscription?.unsubscribe(); // Cancel any ongoing fetch
        this.router.navigate(['/']);
    }
  }
}