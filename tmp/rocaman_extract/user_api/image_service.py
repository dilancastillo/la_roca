import os
import uuid
from PIL import Image
from io import BytesIO
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class ImageService:
    def __init__(self):
        # Crear directorio para imágenes si no existe
        self.images_dir = os.path.join(settings.MEDIA_ROOT, 'product_images')
        os.makedirs(self.images_dir, exist_ok=True)
    
    def process_and_save_image(self, image_file):
        """
        Procesa y guarda una imagen, reduciendo su calidad si es necesario
        """
        try:
            # Generar UUID único para la imagen
            image_id = str(uuid.uuid4())
            
            # Obtener extensión del archivo original
            original_name = image_file.name
            extension = os.path.splitext(original_name)[1].lower()
            
            # Abrir la imagen con Pillow
            with Image.open(image_file) as img:
                # Convertir a RGB si es necesario
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Obtener dimensiones originales
                original_width, original_height = img.size
                
                # Calcular nueva calidad basada en el tamaño
                quality = self._calculate_quality(original_width, original_height)
                
                # Redimensionar si es muy grande (más de 800px en cualquier dimensión)
                max_dimension = 800
                if original_width > max_dimension or original_height > max_dimension:
                    # Mantener proporción de aspecto
                    if original_width > original_height:
                        new_width = max_dimension
                        new_height = int((original_height * max_dimension) / original_width)
                    else:
                        new_height = max_dimension
                        new_width = int((original_width * max_dimension) / original_height)
                    
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    logger.info(f"Imagen redimensionada de {original_width}x{original_height} a {new_width}x{new_height}")
                
                # Preparar buffer para guardar
                buffer = BytesIO()
                
                # Guardar con la calidad calculada
                if extension in ['.jpg', '.jpeg']:
                    img.save(buffer, format='JPEG', quality=quality, optimize=True)
                elif extension == '.png':
                    # Para PNG, usar compresión en lugar de calidad
                    img.save(buffer, format='PNG', optimize=True, compress_level=6)
                else:
                    # Para otros formatos, convertir a JPEG
                    extension = '.jpg'
                    img.save(buffer, format='JPEG', quality=quality, optimize=True)
                
                # Generar nombre del archivo
                filename = f"{image_id}{extension}"
                filepath = os.path.join(self.images_dir, filename)
                
                # Guardar archivo en disco
                with open(filepath, 'wb') as f:
                    f.write(buffer.getvalue())
                
                # Obtener tamaño del archivo guardado
                file_size = os.path.getsize(filepath)
                file_size_mb = file_size / (1024 * 1024)
                
                logger.info(f"Imagen guardada: {filename}, tamaño: {file_size_mb:.2f}MB, calidad: {quality}")
                
                return {
                    'id': image_id,
                    'extension': extension,
                    'filepath': filepath,
                    'size_mb': file_size_mb,
                    'width': img.width,
                    'height': img.height
                }
                
        except Exception as e:
            logger.error(f"Error procesando imagen: {str(e)}")
            raise
    
    def _calculate_quality(self, width, height):
        """
        Calcula la calidad de la imagen basada en sus dimensiones
        """
        # Para imágenes pequeñas, usar alta calidad
        if width <= 400 and height <= 400:
            return 95
        
        # Para imágenes medianas, usar calidad media-alta
        elif width <= 800 and height <= 800:
            return 85
        
        # Para imágenes grandes, usar calidad media
        else:
            return 75
    
    def get_image_path(self, image_id, extension):
        """
        Obtiene la ruta completa de una imagen por su ID y extensión
        """
        filename = f"{image_id}{extension}"
        return os.path.join(self.images_dir, filename)
    
    def image_exists(self, image_id, extension):
        """
        Verifica si una imagen existe en el sistema de archivos
        """
        filepath = self.get_image_path(image_id, extension)
        return os.path.exists(filepath)
