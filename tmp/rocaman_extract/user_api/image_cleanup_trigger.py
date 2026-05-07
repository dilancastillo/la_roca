import os
import time
import threading
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

# Variable global para controlar si el trigger ya está ejecutándose
_cleanup_trigger_running = False

def start_cleanup_trigger():
    """
    Función global para iniciar el trigger de limpieza
    """
    global _cleanup_trigger_running
    
    if _cleanup_trigger_running:
        logger.info("El trigger de limpieza ya está ejecutándose")
        return
    
    _cleanup_trigger_running = True
    
    def cleanup_worker():
        global _cleanup_trigger_running
        while _cleanup_trigger_running:
            try:
                logger.info("Ejecutando limpieza automática de imágenes huérfanas...")
                cleanup_orphaned_images()
                logger.info("Limpieza automática completada")
            except Exception as e:
                logger.error(f"Error en limpieza automática: {str(e)}")
            
            # Esperar 1 hora (3600 segundos)
            time.sleep(3600)
    
    # Crear y iniciar el hilo en segundo plano
    cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
    cleanup_thread.start()
    logger.info("Trigger de limpieza automática iniciado")

def stop_cleanup_trigger():
    """
    Función para detener el trigger de limpieza
    """
    global _cleanup_trigger_running
    _cleanup_trigger_running = False
    logger.info("Trigger de limpieza detenido")

def cleanup_orphaned_images():
    """
    Limpia las imágenes huérfanas que no están asociadas a ningún order_product
    y tienen más de 10 días de antigüedad
    """
    try:
        from .models import ProductImage
        
        # Calcular la fecha límite (10 días atrás)
        cutoff_date = timezone.now() - timedelta(days=10)
        
        # Buscar imágenes huérfanas
        orphaned_images = ProductImage.objects.filter(
            order_product__isnull=True,
            upload_date__lt=cutoff_date
        )
        
        deleted_count = 0
        for image in orphaned_images:
            try:
                # Eliminar archivo físico del disco
                if delete_image_file(image.id, image.extension):
                    # Eliminar registro de la base de datos
                    image.delete()
                    deleted_count += 1
                    logger.info(f"Imagen huérfana eliminada: {image.id}.{image.extension}")
                else:
                    logger.warning(f"No se pudo eliminar archivo físico: {image.id}.{image.extension}")
            except Exception as e:
                logger.error(f"Error eliminando imagen {image.id}: {str(e)}")
        
        if deleted_count > 0:
            logger.info(f"Limpieza completada: {deleted_count} imágenes huérfanas eliminadas")
        else:
            logger.info("No se encontraron imágenes huérfanas para eliminar")
            
    except Exception as e:
        logger.error(f"Error en limpieza de imágenes huérfanas: {str(e)}")

def delete_image_file(image_id, extension):
    """
    Elimina el archivo físico de la imagen del disco
    """
    try:
        images_dir = os.path.join(settings.MEDIA_ROOT, 'product_images')
        filepath = os.path.join(images_dir, f"{image_id}{extension}")
        
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Archivo eliminado del disco: {filepath}")
            return True
        else:
            logger.warning(f"Archivo no encontrado en disco: {filepath}")
            return False
    except Exception as e:
        logger.error(f"Error eliminando archivo {image_id}.{extension}: {str(e)}")
        return False

def is_trigger_running():
    """
    Verifica si el trigger está ejecutándose
    """
    return _cleanup_trigger_running
