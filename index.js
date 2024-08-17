const axios = require('axios');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/celulares', async (req, res) => {
    try {
        let allItems = [];
        let offset = 0;
        const limit = 50;

        while (allItems.length < 1000) {
            const response = await axios.get('https://api.mercadolibre.com/sites/MLM/search', {
                params: {
                    category: 'MLM1055', // Categoría para celulares
                    sort: 'price_asc', // Ordenar por precio ascendente
                    limit: limit, // Obtener 50 artículos por solicitud
                    offset: offset // Desplazamiento
                }
            });

            const items = response.data.results.map(item => ({
                sellerId: item.seller.id,
                sellerName: item.seller.nickname,
                brand: item.attributes.find(attr => attr.id === 'BRAND')?.value_name || 'N/A',
                freeShipping: item.shipping.free_shipping,
                logisticType: item.shipping.logistic_type,
                sellerLocation: item.seller_address?.state?.name || 'Ubicación desconocida',
                condition: item.condition,
                priceRange: item.price
            }));

            allItems = [...allItems, ...items];
            offset += limit;

            if (response.data.results.length < limit) {
                break; // No hay más resultados
            }
        }

        res.json(allItems.slice(0, 1000)); // Devolver solo los primeros 1000 artículos
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al consultar la API de Mercado Libre');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});