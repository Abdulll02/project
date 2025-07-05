import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Charts from './Chart';
// Для слайдера можно использовать rc-slider или Material-UI, здесь пример с input type=range

const ProductTable = ({ reload }) => {
    const [products, setProducts] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);
    const [minRating, setMinRating] = useState(0);
    const [minReviews, setMinReviews] = useState(0);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/products/', {
                    params: {
                        min_price: minPrice,
                        max_price: maxPrice,
                        min_rating: minRating,
                        min_reviews: minReviews
                    }
                });
                setProducts(response.data);
            } catch (error) {
                console.error('Ошибка при получении товаров:', error);
                setProducts([]);
            }
        };
        fetchProducts();
    }, [minPrice, maxPrice, minRating, minReviews, reload]);

    // Сортировка
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const sortedProducts = [...products].sort((a, b) => {
        if (!sortField) return 0;
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // Подготовка данных для графиков
    const priceRanges = ['0-1000', '1000-5000', '5000-10000', '10000+'];
    const priceCounts = [0, 0, 0, 0];
    sortedProducts.forEach(p => {
        if (p.price < 1000) priceCounts[0]++;
        else if (p.price < 5000) priceCounts[1]++;
        else if (p.price < 10000) priceCounts[2]++;
        else priceCounts[3]++;
    });
    // Для линейного графика: размер скидки vs рейтинг
    const discountRatings = sortedProducts.map(p => p.rating);
    const discountAmounts = sortedProducts.map(p => (p.discount_price ? p.discount_price - p.price : 0));

    return (
        <div>
            <h1>Товары</h1>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <label>
                    Цена от:
                    <input type='range' min='0' max='100000' value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} />
                    {minPrice}
                </label>
                <label>
                    Цена до:
                    <input type='range' min='0' max='100000' value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
                    {maxPrice}
                </label>
                <label>
                    Мин. рейтинг:
                    <input type='number' value={minRating} onChange={e => setMinRating(Number(e.target.value))} step='0.1' min='0' max='5' />
                </label>
                <label>
                    Мин. отзывов:
                    <input type='number' value={minReviews} onChange={e => setMinReviews(Number(e.target.value))} min='0' />
                </label>
            </div>
            <table border="1" cellPadding="5" style={{ width: '100%', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('title')}>Название товара</th>
                        <th onClick={() => handleSort('price')}>Цена</th>
                        <th onClick={() => handleSort('discount_price')}>Цена без скидки</th>
                        <th onClick={() => handleSort('rating')}>Рейтинг</th>
                        <th onClick={() => handleSort('reviews_count')}>Количество отзывов</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedProducts
                        .filter(p => p.price <= maxPrice)
                        .map(product => (
                        <tr key={product.id}>
                            <td>{product.title}</td>
                            <td>{product.price}</td>
                            <td>{product.discount_price}</td>
                            <td>{product.rating}</td>
                            <td>{product.reviews_count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Charts data={{ priceRanges, priceCounts, discountRanges: discountAmounts, discountRatings }} />
        </div>
    );
};

export default ProductTable;
