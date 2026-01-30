import { Component } from '@angular/core';

interface CarouselItem {
    id: number;
    src: string;
    position: 'left' | 'middle' | 'right';
}

import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    cartCount: number = 0;

    constructor(private cartService: CartService) {
        this.cartService.cartCount$.subscribe(count => {
            this.cartCount = count;
        });
        console.log('HomeComponent initialized');
    }

    carouselItems: CarouselItem[] = [
        {
            id: 1,
            src: 'https://dqp736wsu6w3m.cloudfront.net/s3bucket/w1000/looks/1797/upscale-white-suit-outfit.jpeg',
            position: 'middle'
        },
        {
            id: 2,
            src: 'https://img.freepik.com/foto-gratis/retrato-mujer-mandona-actitud-posando-blanco_158595-5524.jpg',
            position: 'left'
        },
        {
            id: 3,
            src: 'https://img.freepik.com/foto-gratis/estilo-vida-barrio-amigos_23-2149746742.jpg?semt=ais_hybrid&w=740&q=80',
            position: 'right'
        }
    ];

    featuredProducts: Product[] = [
        {
            id: 1,
            name: 'Chaqueta urbana',
            price: 59.99,
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500',
            category: 'men',
            size: ['M', 'L'],
            color: 'Negro',
            brand: 'UrbanStyle'
        },
        {
            id: 2,
            name: 'Pantalón vaquero',
            price: 45.50,
            image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500',
            category: 'men',
            size: ['30', '32', '34'],
            color: 'Azul',
            brand: 'DenimCo'
        },
        {
            id: 3,
            name: 'Camiseta básica',
            price: 25.00,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
            category: 'women',
            size: ['S', 'M', 'L'],
            color: 'Blanco',
            brand: 'Basics'
        },
        {
            id: 4,
            name: 'Zapatillas de running',
            price: 89.99,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
            category: 'men',
            size: ['40', '42', '44'],
            color: 'Rojo',
            brand: 'SportPlus'
        }
    ];

    onCarouselClick(clickedItem: CarouselItem): void {
        if (clickedItem.position === 'middle') {
            return;
        }

        const currentMiddle = this.carouselItems.find(item => item.position === 'middle');
        if (!currentMiddle) return;

        const clickedPosition = clickedItem.position;

        currentMiddle.position = clickedPosition;

        clickedItem.position = 'middle';
    }

    addToCart(product: Product) {
        this.cartService.addToCart(product);
        alert(`¡${product.name} añadido al carrito!`);
    }
}
