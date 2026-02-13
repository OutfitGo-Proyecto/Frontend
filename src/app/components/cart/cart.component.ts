import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../interfaces/product.interface';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
    cartItems: CartItem[] = [];
    totalPrice: number = 0;

    constructor(public cartService: CartService) { }

    ngOnInit(): void {
        this.cartService.cartItems$.subscribe(items => {
            this.cartItems = items;
            this.calculateTotal();
        });
    }

    calculateTotal() {
        this.totalPrice = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }

    removeItem(id: number) {
        this.cartService.removeFromCart(id);
    }

    clearCart() {
        this.cartService.clearCart();
    }
}
