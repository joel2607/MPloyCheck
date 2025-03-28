// home.component.ts

import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
// Import CommonModule, HttpClientModule, AND FormsModule for standalone component
import { CommonModule, isPlatformBrowser, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http'; // Import HttpClient & Module
import { Subscription } from 'rxjs'; // To manage HTTP subscription
import { finalize } from 'rxjs/operators'; // To handle completion

// --- Interface based on the Mongoose Schema ---
export interface JobOffer {
  _id: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  salary: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Define a basic user structure including the role
export interface User {
    _id: string;
    name: string;
    email: string;
    role?: 'admin' | 'user'; // Make role optional if not always present
    // Add other user properties if available
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./global.styles.scss'],
  standalone: true,
  // Add HttpClientModule, Pipes, and FormsModule here
  imports: [CommonModule, HttpClientModule, CurrencyPipe, DatePipe, FormsModule] // <-- Add FormsModule
})
export class HomeComponent implements OnInit, OnDestroy {
  user: User | null = null; // Use the User interface
  jobOffers: JobOffer[] = [];
  isLoadingJobs = false;
  jobFetchError: string | null = null;
  private jobSubscription: Subscription | null = null;

  // --- Admin Specific Properties ---
  adminSliderValue: number = 50; // Default slider value
  isSubmittingSlider: boolean = false; // Loading state for POST
  sliderSubmitError: string | null = null; // Error for POST
  sliderSubmitSuccess: string | null = null; // Success message for POST
  isAdminDataLoading: boolean = false; // Loading state for GET
  adminDataResponse: any = null;       // To store response from GET
  adminDataError: string | null = null; // Error from GET
  private adminPostSubscription: Subscription | null = null;
  private adminGetSubscription: Subscription | null = null;
  // --------------------------------

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
        const userString = localStorage.getItem('user');
        if (userString) {
          try {
            // Parse and explicitly type the user
            const parsedUser = JSON.parse(userString) as User;
            // Basic validation
            if (parsedUser && parsedUser._id && parsedUser.email && parsedUser.name) {
                this.user = parsedUser;
                // Fetch jobs ONLY if user is loaded successfully
                this.fetchJobOffers(this.user._id);
            } else {
                console.error("User data loaded from localStorage is incomplete or invalid.");
                this.logout(); // Log out if essential user info is missing
            }
          } catch (error) {
              console.error("Error parsing user data from localStorage:", error);
              this.logout();
          }
        }
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.jobSubscription?.unsubscribe();
    this.adminPostSubscription?.unsubscribe();
    this.adminGetSubscription?.unsubscribe();
  }

  fetchJobOffers(userId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isLoadingJobs = true;
    this.jobFetchError = null;
    this.jobOffers = [];

    const apiUrl = `http://localhost:8000/jobs/${userId}`;

    // Cancel previous job fetch if any
    this.jobSubscription?.unsubscribe();

    this.jobSubscription = this.http.get<JobOffer[]>(apiUrl)
      .pipe(
        finalize(() => { this.isLoadingJobs = false; })
      )
      .subscribe({
        next: (offers) => {
          this.jobOffers = offers;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching job offers:', error);
          this.jobFetchError = `Failed to load job offers (${error.statusText || 'Unknown error'}). Please try again.`;
        }
      });
  }

  // --- Admin: Submit Slider Value (POST) ---
  submitSliderValue(): void {
    if (!isPlatformBrowser(this.platformId) || this.isSubmittingSlider) return;

    this.isSubmittingSlider = true;
    this.sliderSubmitError = null;
    this.sliderSubmitSuccess = null;
    const apiUrl = 'http://localhost:8000/admin'; // Target URL
    const payload = { value: this.adminSliderValue };

    // Cancel previous post if any
    this.adminPostSubscription?.unsubscribe();

    this.adminPostSubscription = this.http.post(apiUrl, payload)
        .pipe(
            finalize(() => { this.isSubmittingSlider = false; })
        )
        .subscribe({
            next: (response) => {
                console.log('Slider value submitted successfully:', response);
                this.sliderSubmitSuccess = 'Value submitted successfully!';
                // Clear success message after a delay
                setTimeout(() => this.sliderSubmitSuccess = null, 3000);
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error submitting slider value:', error);
                this.sliderSubmitError = `Failed to submit value (${error.statusText || 'Unknown error'}).`;
                 // Clear error message after a delay
                 setTimeout(() => this.sliderSubmitError = null, 5000);
            }
        });
  }

  // --- Admin: Fetch Data (GET) ---
  fetchAdminData(): void {
      if (!isPlatformBrowser(this.platformId) || this.isAdminDataLoading) return;

      this.isAdminDataLoading = true;
      this.adminDataResponse = null;
      this.adminDataError = null;
      const apiUrl = 'http://localhost:8000/admin'; // Target URL

      // Cancel previous fetch if any
      this.adminGetSubscription?.unsubscribe();

      this.adminGetSubscription = this.http.get<any>(apiUrl) // Use <any> or a specific interface if response structure is known
        .pipe(
            finalize(() => { this.isAdminDataLoading = false; })
        )
        .subscribe({
            next: (response) => {
                console.log('Admin data fetched successfully:', response);
                this.adminDataResponse = response;
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error fetching admin data:', error);
                // Provide more specific error if possible
                if (error.status === 0) {
                    this.adminDataError = 'Failed to connect to the server. Is it running?';
                } else {
                    this.adminDataError = `Failed to fetch data (${error.status} ${error.statusText || 'Unknown error'}).`;
                }
            }
        });
  }
  // ---------------------------------------

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  navigateToSignin(): void {
    this.router.navigate(['/signin']);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.user = null;
        this.jobOffers = [];
        this.jobFetchError = null;
        // Clear admin states on logout
        this.adminSliderValue = 50;
        this.adminDataResponse = null;
        this.adminDataError = null;
        this.sliderSubmitError = null;
        this.sliderSubmitSuccess = null;
        // Unsubscribe all
        this.jobSubscription?.unsubscribe();
        this.adminPostSubscription?.unsubscribe();
        this.adminGetSubscription?.unsubscribe();
        this.router.navigate(['/']);
    }
  }
}