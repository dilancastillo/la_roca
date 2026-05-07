from .models import AppUser, Tela, Prenda, Stock, Talla, Order, OrderProduct, Cliente, Cortador, Parameter
from django.core.exceptions import ValidationError
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import ProductImage

UserModel = get_user_model()

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    ##
    def check_user(self, clean_data):
        user = authenticate(username=clean_data['email'], password=clean_data['password'])
        if not user:
            raise ValidationError('user not found')
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('email', 'username')

class AppUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = ['id', 'email', 'username']

class TelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tela
        fields = ['id','code', 'color', 'stock']

class PrendaSerializer(serializers.ModelSerializer):
    descriptions = serializers.SerializerMethodField()

    class Meta:
        model = Prenda
        fields = ['id', 'name', 'stocks', 'details', 'descriptions']  # Include descriptions

    def get_descriptions(self, obj):
        descriptions = []
        for st in obj.stocks:  # Assuming `stocks` is a list of stock IDs
            stock = Stock.objects.filter(stock=st).first()
            if stock:
                descriptions.append(stock.description)
        return descriptions



class TallaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talla
        fields = '__all__'  # Includes all fields in the model

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'cc', 'name', 'email', 'cellphone']

class PrendaNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prenda
        fields = ['id', 'name', 'stocks']

class TelaNestedSerializer(serializers.ModelSerializer):
    stock_description = serializers.CharField(source='stock.description', read_only=True)

    class Meta:
        model = Tela
        fields = ['id', 'code', 'color', 'stock_description']

class UserNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = ['id', 'email', 'username']

class ClienteNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'cc', 'name', 'email', 'cellphone']

class CortadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cortador
        fields = ['id', 'name', 'cellphone']

class OrderProductSerializer(serializers.ModelSerializer):
    prenda = PrendaNestedSerializer()
    tela = TelaNestedSerializer()

    class Meta:
        model = OrderProduct
        fields = ['id', 'order', 'prenda', 'tela', 'quantity', 'size', 'sex', 'details']

class OrderSerializer(serializers.ModelSerializer):
    seller = UserNestedSerializer()
    client = ClienteNestedSerializer()
    cortador = CortadorSerializer()
    products = OrderProductSerializer(many=True, source='orderproduct_set')

    class Meta:
        model = Order
        fields = '__all__'

class ParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameter
        fields = ['id', 'name', 'description', 'value', 'created_at', 'updated_at']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'extension', 'upload_date', 'order_product_id']
