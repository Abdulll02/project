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
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('table'); // 'table' or 'cards'

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
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
            } finally {
                setLoading(false);
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
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <h2 style={{margin:0}}>Товары</h2>
                <div className="toolbar">
                    <div style={{color:'var(--muted)',fontSize:13}}>Вид:</div>
                    <button onClick={() => setView('table')} className={view==='table' ? '' : 'secondary'}>Таблица</button>
                    <button onClick={() => setView('cards')} className={view==='cards' ? '' : 'secondary'}>Карточки</button>
                </div>
            </div>

            <div className="panel filters" style={{marginBottom:12}}>
                <div>
                    <label style={{display:'block',color:'var(--muted)',fontSize:13}}>Цена от</label>
                    <input type='number' value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} />
                </div>
                <div>
                    <label style={{display:'block',color:'var(--muted)',fontSize:13}}>До</label>
                    <input type='number' value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
                </div>
                <div>
                    <label style={{display:'block',color:'var(--muted)',fontSize:13}}>Мин. рейтинг</label>
                    <input type='number' value={minRating} onChange={e => setMinRating(Number(e.target.value))} step='0.1' min='0' max='5' />
                </div>
                <div>
                    <label style={{display:'block',color:'var(--muted)',fontSize:13}}>Мин. отзывов</label>
                    <input type='number' value={minReviews} onChange={e => setMinReviews(Number(e.target.value))} min='0' />
                </div>
            </div>

            {loading ? (
                <div className="main-card panel" style={{padding:18}}>
                    <div style={{height:8,background:'rgba(255,255,255,0.03)',borderRadius:6,marginBottom:8}} />
                    <div style={{height:8,background:'rgba(255,255,255,0.03)',borderRadius:6,marginBottom:8}} />
                    <div style={{height:8,background:'rgba(255,255,255,0.03)',borderRadius:6,width:'60%'}} />
                </div>
            ) : (
                <>
                    {view === 'table' ? (
                        <table className="app-table" style={{marginBottom:16}}>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('title')}>Название</th>
                                    <th onClick={() => handleSort('price')}>Цена</th>
                                    <th onClick={() => handleSort('discount_price')}>Цена без скидки</th>
                                    <th onClick={() => handleSort('rating')}>Рейтинг</th>
                                    <th onClick={() => handleSort('reviews_count')}>Отзывы</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProducts.filter(p => p.price <= maxPrice).map(product => (
                                    <tr key={product.id}>
                                        <td style={{maxWidth:420}}>{product.title}</td>
                                        <td className="price">{product.price ? `${product.price} ₽` : '-'}</td>
                                        <td>{product.discount_price ? `${product.discount_price} ₽` : '-'}</td>
                                        <td>{product.rating ?? '-'}</td>
                                        <td>{product.reviews_count ?? '-'}</td>
                                    </tr>
                                ))}
                                {sortedProducts.length === 0 && (
                                    <tr><td colSpan={5} className="empty">Список пуст — попробуйте изменить фильтры</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <div className="cards">
                            {sortedProducts.filter(p => p.price <= maxPrice).map(product => (
                                <div className="card" key={product.id}>
                                    <div className="title">{product.title}</div>
                                    <div className="meta">Рейтинг: {product.rating ?? '-'} · Отзывов: {product.reviews_count ?? '-'}</div>
                                    <div style={{marginTop:'auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                        <div className="price">{product.price ? `${product.price} ₽` : '-'}</div>
                                        <div style={{color:'var(--muted)',fontSize:12}}>{product.discount_price ? `до ${product.discount_price} ₽` : ''}</div>
                                    </div>
                                </div>
                            ))}
                            {sortedProducts.length === 0 && <div className="empty">Пусто</div>}
                        </div>
                    )}
                </>
            )}

            <div style={{marginTop:18}}>
                <Charts data={{ priceRanges, priceCounts, discountRanges: discountAmounts, discountRatings }} />
            </div>
        </div>
    );
};

export default ProductTable;
