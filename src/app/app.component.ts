import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'OutfitGo';
  cartCount: number = 0;
  isSearchVisible: boolean = false;
  searchQuery: string = '';

  constructor(private cartService: CartService, private router: Router) {
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  toggleSearch() {
    this.isSearchVisible = !this.isSearchVisible;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.isSearchVisible = false;
    }
  }
}
