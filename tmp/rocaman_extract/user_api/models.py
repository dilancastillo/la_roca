from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.models import Group
from django.contrib.postgres.fields import ArrayField

Group.add_to_class('route_dashboard', models.CharField(max_length=20, default='/'))


class AppUserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError('An email is required.')
        if not password:
            raise ValueError('A password is required.')
        email = self.normalize_email(email)
        user = self.model(email=email)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None):
        if not email:
            raise ValueError('An email is required.')
        if not password:
            raise ValueError('A password is required.')
        user = self.create_user(email, password)
        user.is_superuser = True
        user.save()
        return user


class AppUser(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=50, unique=True)
    username = models.CharField(max_length=50)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    objects = AppUserManager()

    def __str__(self):
        return self.username


class Stock(models.Model):
    stock = models.PositiveIntegerField()
    description = models.CharField(max_length=50)  #

    class Meta:
        db_table = 'stocks'  # This links the model to the existing SQL table

    def __str__(self):
        return f"{self.stock}-{self.description}"


class Tela(models.Model):
    code = models.CharField(max_length=20)
    color = models.CharField(max_length=50)  # Store as a string (e.g., "(251, 251, 251)")
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)  # Changed to ForeignKey

    class Meta:
        db_table = 'telas'  # This links the model to the existing SQL table

    def __str__(self):
        return f"{self.code}"


class Prenda(models.Model):
    name = models.CharField(max_length=20)
    stocks = ArrayField(models.IntegerField(), blank=True, default=list)
    details = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'prendas'  # This links the model to the existing SQL table

    def __str__(self):
        return self.name


class Talla(models.Model):
    name = models.CharField(max_length=20)
    sex = models.CharField(max_length=10)
    values = ArrayField(models.TextField(), blank=True, default=list)  # Change from IntegerField to TextField

    class Meta:
        db_table = 'tallas'  # This links the model to the existing SQL table

    def __str__(self):
        return f"{self.name}-{self.sex}-{self.values}"


class Cliente(models.Model):
    cc = models.CharField(max_length=20, unique=True)  # Assuming 'cc' is a unique customer identifier
    name = models.CharField(max_length=20)
    email = models.EmailField(max_length=50, null=True, blank=True)
    cellphone = models.CharField(max_length=20)

    class Meta:
        db_table = 'clientes'
    def __str__(self):
        return self.name

class Cortador(models.Model):
    name = models.CharField(max_length=20)
    cellphone = models.CharField(max_length=20)

    class Meta:
        db_table = 'cortadores'  # This links the model to the existing SQL table

    def __str__(self):
        return self.name


class Parameter(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'parameters'

    def __str__(self):
        return f"{self.name}: {self.value}"


class Order(models.Model):
    seller = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    client = models.ForeignKey(Cliente, on_delete=models.CASCADE, default=1)
    order_date = models.DateTimeField(auto_now_add=True)
    cortador = models.ForeignKey(Cortador, on_delete=models.CASCADE)

    class Meta:
        db_table = 'orders'

    def __str__(self):
        return f"Order {self.id} - {self.client.name}"


class OrderProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    prenda = models.ForeignKey(Prenda, on_delete=models.CASCADE)
    tela = models.ForeignKey(Tela, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    size = models.CharField(max_length=15)
    sex = models.CharField(max_length=10)
    details = models.TextField(null=False)

    class Meta:
        db_table = 'orders_products'

    def __str__(self):
        return f"Order {self.id} - {self.client.name}"


class ProductImage(models.Model):
    id = models.CharField(max_length=36, primary_key=True)  # UUID
    extension = models.CharField(max_length=10)
    upload_date = models.DateTimeField(auto_now_add=True)
    order_product = models.ForeignKey(OrderProduct, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'product_images'

    def __str__(self):
        return f"Image {self.id}.{self.extension}"