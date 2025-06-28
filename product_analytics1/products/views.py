from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer
from django_filters import rest_framework as filters

class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    min_rating = filters.NumberFilter(field_name='rating', lookup_expr='gte')
    min_reviews = filters.NumberFilter(field_name='reviews_count', lookup_expr='gte')


    class Meta:
        model = Product
        fields = ['min_price', 'min_rating', 'min_reviews']

class ProductList(generics.ListAPIView):
    queryset = Product.objects.all() # type: ignore
    serializer_class = ProductSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ProductFilter
