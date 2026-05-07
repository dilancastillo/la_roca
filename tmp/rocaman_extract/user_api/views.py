from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AppUser, Tela, Prenda, Stock, Talla, Order, OrderProduct, Cliente, Cortador, Parameter, ProductImage
from .serializers import (
    AppUserSerializer,
    UserLoginSerializer,
    TelaSerializer,
    PrendaSerializer,
    TallaSerializer,
    OrderSerializer,
    ClienteSerializer,
    CortadorSerializer
)
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from rest_framework import permissions, status
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)
from .validations import custom_validation, validate_email, validate_password
from rest_framework.pagination import PageNumberPagination

import json

# Constantes para parámetros del sistema
STOCK_COLORS_MODEL_SELECTOR_PARAM = 'stock_colors_model_selector'

class UserListCreateView(APIView):
    def get(self, request):
        users = AppUser.objects.all()
        serializer = AppUserSerializer(users, many=True)
        return Response(serializer.data)

class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    ##
    def post(self, request):
        print(TokenObtainPairView.as_view())

        data = request.data
        assert validate_email(data)
        assert validate_password(data)
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.check_user(data)
            refresh = RefreshToken.for_user(user)

            list_groups = list()
            for g in user.groups.all():
                list_groups.append({
                    'name': g.name,
                    'route': g.route_dashboard,
                })

            auth_data = {
                'id':user.id,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'roles': list_groups,
            }
            login(request, user)
            return Response(auth_data, status=status.HTTP_200_OK)




class TelaByStockView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        stock_value = request.query_params.get('stock', None)

        if stock_value is not None:
            try:
                stock_value = int(stock_value)  # Convert stock to an integer

                # Get the stock object based on the stock value
                stock = Stock.objects.filter(stock=stock_value).first()

                if not stock:
                    return Response({"detail": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)

                # Use stock.id as the foreign key reference
                telas = Tela.objects.filter(stock=stock.id)

                serializer = TelaSerializer(telas, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

            except ValueError:
                return Response({"detail": "Invalid stock value"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Stock parameter is required"}, status=status.HTTP_400_BAD_REQUEST)


class TelaByParameterView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        try:
            # Get the stock_colors_model_selector parameter value
            parameter = Parameter.objects.filter(name=STOCK_COLORS_MODEL_SELECTOR_PARAM).first()
            
            if not parameter:
                return Response({"detail": f"Parameter '{STOCK_COLORS_MODEL_SELECTOR_PARAM}' not found"}, status=status.HTTP_404_NOT_FOUND)

            stock_value = int(parameter.value)

            # Get the stock object based on the parameter value
            stock = Stock.objects.filter(stock=stock_value).first()

            if not stock:
                return Response({"detail": f"Stock {stock_value} not found"}, status=status.HTTP_404_NOT_FOUND)

            # Use stock.id as the foreign key reference
            telas = Tela.objects.filter(stock=stock.id)

            serializer = TelaSerializer(telas, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ValueError:
            return Response({"detail": "Invalid stock value in parameter"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrendasAvailable(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        prendas = Prenda.objects.all()

        # Add description from the stock table for each prenda
        for prenda in prendas:
            descriptions = []
            for st in prenda.stocks:
                stock = Stock.objects.filter(stock=st).first()  # Assuming 'stock' in Prenda is the stock ID
                if stock:
                    descriptions.append(stock.description)  # Add description to prenda object

            prenda.descriptions = descriptions

        serializer = PrendaSerializer(prendas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TallaByPrendaAndSexView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        p_id = request.query_params.get('name', None)
        sex = request.query_params.get('sex', None)
        if p_id is not None and sex is not None:
            try:
                product = Prenda.objects.filter(id=p_id).first()
                tallas = Talla.objects.filter(name=product.name, sex=sex)
                serializer = TallaSerializer(tallas, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except ValueError:
                return Response({"detail": "Invalid sex or name value"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"detail": "sex and name parameters are required"}, status=status.HTTP_400_BAD_REQUEST)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 100

class RetrieveOrdersAPIView(APIView):
    """
    API endpoint to retrieve all orders and create multiple orders from a list of orders.
    """
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)
    pagination_class = StandardResultsSetPagination

    def get(self, request, *args, **kwargs):
        """
        Retrieve all available orders.
        Optional query parameters:
        - client_cc: Filter orders by client CC (national ID)
        - seller_id: Filter orders by seller ID
        - start_date: Filter orders created on or after this date (format: YYYY-MM-DD)
        - end_date: Filter orders created on or before this date (format: YYYY-MM-DD)
        """
        from django.db.models import Q
        from datetime import datetime

        # Get the query parameters
        client_cc = request.query_params.get('client_cc')
        seller_id = request.query_params.get('seller_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Start with all orders
        orders = Order.objects.all()

        # Apply filters if provided
        if client_cc:
            try:
                # Get the cliente using cc and then filter orders by cliente_id
                client = Cliente.objects.filter(cc__contains=client_cc).first()
                if client:
                    orders = orders.filter(client=client)
                else:
                    return Response(
                        {"error": f"No client found with CC: {client_cc}"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            except Exception as e:
                return Response(
                    {"error": f"Error filtering by client_cc: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if seller_id:
            try:
                orders = orders.filter(seller_id=int(seller_id))
            except ValueError:
                return Response(
                    {"error": "Invalid seller_id. Must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if start_date:
            try:
                start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
                orders = orders.filter(order_date__gte=start_datetime)
            except ValueError:
                return Response(
                    {"error": "Invalid start_date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if end_date:
            try:
                end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
                # Add time to include the whole day
                end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
                orders = orders.filter(order_date__lte=end_datetime)
            except ValueError:
                return Response(
                    {"error": "Invalid end_date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Order by most recent first
        orders = orders.order_by('-order_date')
        
        # Aplicar paginación
        paginator = self.pagination_class()
        paginated_orders = paginator.paginate_queryset(orders, request)
        serializer = OrderSerializer(paginated_orders, many=True)
        
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, *args, **kwargs):
        orders_data = request.data  # Expecting a list of orders

        cortador_id = orders_data["cortador_id"]
        products = orders_data["products"]

        user_name = request.user
        user = AppUser.objects.filter(username=user_name).first()

        if not isinstance(products, list):
            return Response(
                {"error": "Invalid data format. Expected a list of orders."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        required_fields = [
            "product_id",
            "tela_id",
            "quantity",
            "size",
            "sex",
            "details"
        ]

        invalid_orders = []
        valid_products = []

        # Retrieve Cliente by cc
        client = None
        try:
            client = Cliente.objects.get(cc=orders_data["client_cc"])
        except Cliente.DoesNotExist:
            invalid_orders.append({"order": orders_data, "error": "Cliente not found."})

        cortador = Cortador.objects.get(id=cortador_id)

        order = Order(
            seller=user,
            client=client,
            cortador=cortador
        )

        for product_data in products:
            missing_fields = [field for field in required_fields if field not in product_data]
            if missing_fields:
                invalid_orders.append({"order": product_data, "missing_fields": missing_fields})
                continue  # Skip this order if it's missing fields

            try:
                valid_products.append(
                    OrderProduct(
                        order=order,
                        prenda_id=product_data["product_id"],
                        tela_id=product_data["tela_id"],
                        quantity=product_data["quantity"],
                        size=product_data["size"],
                        sex=product_data["sex"],
                        details=json.dumps(product_data["details"])
                    )
                )
            except Exception as e:
                invalid_orders.append({"order": product_data, "error": str(e)})

        if valid_products:
            order.save()

            # Crear los productos de la orden
            created_products = OrderProduct.objects.bulk_create(valid_products)  # Bulk insert for better performance
            
            # Relacionar imágenes con los productos de la orden si existen
            try:
                # Procesar cada producto y sus imágenes individualmente
                for i, product in enumerate(created_products):
                    # Buscar el producto correspondiente en los datos recibidos
                    if i < len(products):
                        product_data = products[i]
                        # Verificar si el producto tiene imágenes
                        if "image_ids" in product_data and product_data["image_ids"]:
                            image_ids = product_data["image_ids"]
                            if isinstance(image_ids, list) and len(image_ids) > 0:
                                # Relacionar cada imagen con este producto específico
                                for image_id in image_ids:
                                    if image_id:  # Verificar que no sea null o vacío
                                        ProductImage.objects.filter(
                                            id=image_id
                                        ).update(order_product_id=product.id)
                                
                                print(f"Producto {i+1}: Relacionadas {len(image_ids)} imágenes con order_product_id {product.id}")
                
                print(f"Proceso de relación de imágenes completado para la orden {order.id}")
            except Exception as e:
                print(f"Error relacionando imágenes: {str(e)}")
                # No fallar la orden si hay error con las imágenes
            
            return Response(
                {"success": f"{len(valid_products)} orders created.", "invalid_orders": invalid_orders},
                status=status.HTTP_201_CREATED
            )

        return Response(
            {"error": "No valid orders to create.", "invalid_orders": invalid_orders},
            status=status.HTTP_400_BAD_REQUEST,
        )
    

class RetrieveSellersAPIView(APIView):
    """
    Retrieve all sellers.
    """
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        sellers = AppUser.objects.all()
        serializer = AppUserSerializer(sellers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class CheckClienteExistsView(APIView):
    """
    Check if a client with the given 'cc' exists and return client data.
    """
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request, cc):
        try:
            # Try to get the client with the given cc
            cliente = Cliente.objects.get(cc=cc)

            # If a client is found, serialize the client data
            # Assuming you have a serializer for Cliente model
            from .serializers import ClienteSerializer
            serializer = ClienteSerializer(cliente)

            return Response({
                'exists': True,
                'cliente': serializer.data
            }, status=status.HTTP_200_OK)

        except Cliente.DoesNotExist:
            # If no client is found, return exists: False
            return Response({
                'exists': False,
                'cliente': None
            }, status=status.HTTP_200_OK)

class RegisterClienteView(APIView):
    """
    Register a new client.
    """
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)
    def post(self, request):
        serializer = ClienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CortadorView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)
    def get(self, request):
        cortadores = Cortador.objects.all().order_by('name')
        serializer = CortadorSerializer(cortadores, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
