import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Charts = ({ data }) => {
    const priceData = {
        labels: data.priceRanges,
        datasets: [
            {
                label: 'Количество товаров',
                data: data.priceCounts,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const discountData = {
        labels: data.discountRanges,
        datasets: [
            {
                label: 'Рейтинг товаров',
                data: data.discountRatings,
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false,
            },
        ],
    };
    return (
        <div className="chart-container">
            <h2>Гистограмма цен</h2>
            <Bar data={priceData} />
            <h2>Линейный график: размер скидки vs рейтинг</h2>
            <Line data={discountData} />
        </div>
    );
};

export default Charts;
