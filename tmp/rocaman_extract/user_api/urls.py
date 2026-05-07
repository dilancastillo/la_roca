from django.urls import path
from django.http import JsonResponse

from .views import (
    UserListCreateView,
    UserLogin,
    TelaByStockView,
    TelaByParameterView,
    PrendasAvailable,
    TallaByPrendaAndSexView,
    RetrieveOrdersAPIView,
    RetrieveSellersAPIView,
    CheckClienteExistsView,
    RegisterClienteView, CortadorView
)
from .image_views import ImageUploadView, ImageRetrieveView


def api_home(request):
    return JsonResponse({"message": "API root. Available endpoints: /api/users/"})

urlpatterns = [
    path('', api_home, name='api-home'),  # Handles requests to "/api/"
    path('users/', UserListCreateView.as_view(), name='user-list'),
    path('login', UserLogin.as_view(), name='login'),

    path('telas/by_stock/', TelaByStockView.as_view(), name='telas-by-stock'),
    path('telas/by_parameter/', TelaByParameterView.as_view(), name='telas-by-parameter'),
    path('tallas/by_name/by_sex', TallaByPrendaAndSexView.as_view(), name='talla-by-name-sex'),

    path('prendas/', PrendasAvailable.as_view(), name='prendas-available'),

    path('orders/', RetrieveOrdersAPIView.as_view(), name='retrieve-orders'),

    path('sellers/', RetrieveSellersAPIView.as_view(), name='retrieve-sellers'),

    path('clientes/check/<str:cc>/', CheckClienteExistsView.as_view(), name='check_cliente_exists'),
    path('clientes/register/', RegisterClienteView.as_view(), name='register_cliente'),

    path('cortadores', CortadorView.as_view(), name='cortadores'),
    
    # Nuevas URLs para manejo de imágenes
    path('images/upload/', ImageUploadView.as_view(), name='image-upload'),
    path('images/<str:image_id>/', ImageRetrieveView.as_view(), name='image-retrieve'),
]
