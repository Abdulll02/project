from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer
from django_filters import rest_framework as filters
from .parser import parse_products

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

class ParseView(APIView):
    def post(self, request):
        query = request.data.get('query')
        if not query:
            return Response({'error': 'Не передан параметр запроса'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            parse_products(query)
            return Response({'status': 'Парсинг завершён'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ClearProductsView(APIView):
    def post(self, request):
        Product.objects.all().delete()
        return Response({'status': 'Таблица очищена'}, status=status.HTTP_200_OK)
