from rest_framework import serializers
from .models import Cliente


class ClienteSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Cliente con validaciones adicionales
    """
    genero_display = serializers.CharField(source='get_genero_display', read_only=True)
    nivel_satisfaccion_display = serializers.CharField(
        source='get_nivel_de_satisfaccion_display', 
        read_only=True
    )
    
    class Meta:
        model = Cliente
        fields = '__all__'  # Incluye todos los campos del modelo Cliente
        read_only_fields = ['cliente_id']
    
    def validate_edad(self, value):
        """Validación de edad"""
        if value < 18:
            raise serializers.ValidationError("El cliente debe ser mayor de 18 años")
        if value > 120:
            raise serializers.ValidationError("La edad no puede ser mayor a 120 años")
        return value
    
    def validate_saldo(self, value):
        """Validación de saldo"""
        if value < 0:
            raise serializers.ValidationError("El saldo no puede ser negativo")
        return value
    
    def validate_nivel_de_satisfaccion(self, value):
        """Validación de nivel de satisfacción"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("El nivel de satisfacción debe estar entre 1 y 5")
        return value
