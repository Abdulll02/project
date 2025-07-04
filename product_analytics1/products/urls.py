from django.urls import path
from .views import ProductList, ParseView, ClearProductsView

urlpatterns = [
    path('api/products/', ProductList.as_view(), name='product-list'),
    path('api/parse/', ParseView.as_view(), name='parse'),
    path('api/clear_products/', ClearProductsView.as_view(), name='clear-products'),
]
