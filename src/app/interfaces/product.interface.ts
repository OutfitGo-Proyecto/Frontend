export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string; // 'kids', 'men', 'woman'
    size: string[];
    color: string;
    brand: string;
}

export interface CartItem extends Product {
    quantity: number;
}
