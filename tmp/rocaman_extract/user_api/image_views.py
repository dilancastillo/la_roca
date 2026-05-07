from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from django.core.files.uploadedfile import InMemoryUploadedFile
import json
import os
from .models import ProductImage
from .image_service import ImageService
from .serializers import ProductImageSerializer
from . import image_cleanup_trigger
import logging

logger = logging.getLogger(__name__)

# Iniciar el trigger de limpieza automáticamente cuando se importe este módulo
try:
    image_cleanup_trigger.start_cleanup_trigger()
    logger.info("Trigger de limpieza automática iniciado desde image_views")
except Exception as e:
    logger.error(f"Error iniciando trigger de limpieza: {str(e)}")

@method_decorator(csrf_exempt, name='dispatch')
class ImageUploadView(View):
    """
    Vista para subir y procesar imágenes
    """
    
    def post(self, request):
        try:
            # Verificar si hay archivo en la request
            if 'image' not in request.FILES:
                return JsonResponse({
                    'error': 'No se encontró archivo de imagen'
                }, status=400)
            
            image_file = request.FILES['image']
            
            # Validar que sea un archivo de imagen
            if not image_file.content_type.startswith('image/'):
                return JsonResponse({
                    'error': 'El archivo debe ser una imagen'
                }, status=400)
            
            # Procesar y guardar la imagen
            image_service = ImageService()
            result = image_service.process_and_save_image(image_file)
            
            # Crear registro en la base de datos
            product_image = ProductImage.objects.create(
                id=result['id'],
                extension=result['extension']
            )
            
            # Serializar la respuesta
            serializer = ProductImageSerializer(product_image)
            
            return JsonResponse({
                'success': True,
                'image': serializer.data,
                'file_info': {
                    'size_mb': result['size_mb'],
                    'width': result['width'],
                    'height': result['height']
                }
            })
            
        except Exception as e:
            logger.error(f"Error en ImageUploadView: {str(e)}")
            return JsonResponse({
                'error': f'Error procesando imagen: {str(e)}'
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ImageRetrieveView(View):
    """
    Vista para recuperar imágenes por UUID
    """
    
    def get(self, request, image_id):
        try:
            # Obtener parámetros
            extension = request.GET.get('extension', '')
            
            if not extension:
                return JsonResponse({
                    'error': 'Se requiere el parámetro extension'
                }, status=400)
            
            # Buscar la imagen en la base de datos
            try:
                product_image = ProductImage.objects.get(id=image_id, extension=extension)
            except ProductImage.DoesNotExist:
                return JsonResponse({
                    'error': 'Imagen no encontrada'
                }, status=404)
            
            # Verificar que el archivo existe en disco
            image_service = ImageService()
            if not image_service.image_exists(image_id, extension):
                return JsonResponse({
                    'error': 'Archivo de imagen no encontrado en disco'
                }, status=404)
            
            # Obtener ruta del archivo
            filepath = image_service.get_image_path(image_id, extension)
            
            # Servir el archivo
            response = FileResponse(open(filepath, 'rb'))
            
            # Configurar headers para evitar cache
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            return response
            
        except Exception as e:
            logger.error(f"Error en ImageRetrieveView: {str(e)}")
            return JsonResponse({
                'error': f'Error recuperando imagen: {str(e)}'
            }, status=500)
