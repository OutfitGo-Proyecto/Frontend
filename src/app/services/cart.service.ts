import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Product, CartItem } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems = new BehaviorSubject<CartItem[]>([]);
    public cartItems$ = this.cartItems.asObservable();
    public cartCount$ = this.cartItems$.pipe(
        map(items => items.reduce((count, item) => count + item.quantity, 0))
    );

    constructor() { }

    addToCart(product: Product) {
        const currentItems = this.cartItems.getValue();
        const existingItem = currentItems.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
            this.cartItems.next([...currentItems]);
        } else {
            const newItem: CartItem = { ...product, quantity: 1 };
            this.cartItems.next([...currentItems, newItem]);
        }

        console.log('Producto añadido al carrito:', product.name);
        console.log('Estado actual del carrito:', this.cartItems.getValue());
    }

    getCartItems() {
        return this.cartItems.getValue();
    }

    removeFromCart(productId: number) {
        const currentItems = this.cartItems.getValue();
        const updatedItems = currentItems.filter(item => item.id !== productId);
        this.cartItems.next(updatedItems);
    }

    clearCart() {
        this.cartItems.next([]);
    }

    getTotalPrice(): number {
        return this.cartItems.getValue().reduce((total, item) => total + (item.price * item.quantity), 0);
    }
}
