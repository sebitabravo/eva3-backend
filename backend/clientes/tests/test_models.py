"""
Tests para el modelo Cliente
"""
import pytest
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from clientes.models import Cliente

User = get_user_model()


@pytest.mark.django_db
class TestClienteModel:
    """Tests para el modelo Cliente"""
    
    def test_crear_cliente_valido(self):
        """Test: Crear un cliente con datos válidos"""
        user = User.objects.create_user('testuser', 'test@test.com', 'pass123')
        cliente = Cliente.objects.create(
            usuario=user,
            edad=30,
            genero='M',
            saldo=5000.00,
            activo=True,
            nivel_de_satisfaccion=4
        )
        
        assert cliente.cliente_id is not None
        assert cliente.edad == 30
        assert cliente.genero == 'M'
        assert float(cliente.saldo) == 5000.00
        assert cliente.activo is True
        assert cliente.nivel_de_satisfaccion == 4
    
    def test_cliente_edad_minima_invalida(self):
        """Test: Validar edad mínima (18 años)"""
        user = User.objects.create_user('testuser2', 'test2@test.com', 'pass123')
        cliente = Cliente(
            usuario=user,
            edad=17,  # Menor de 18
            genero='F',
            saldo=1000.00,
            activo=True,
            nivel_de_satisfaccion=3
        )
        
        with pytest.raises(ValidationError) as exc_info:
            cliente.save()
        
        assert 'edad' in exc_info.value.message_dict
    
    def test_cliente_edad_maxima_invalida(self):
        """Test: Validar edad máxima (120 años)"""
        user = User.objects.create_user('testuser3', 'test3@test.com', 'pass123')
        cliente = Cliente(
            usuario=user,
            edad=121,  # Mayor de 120
            genero='M',
            saldo=1000.00,
            activo=True,
            nivel_de_satisfaccion=3
        )
        
        with pytest.raises(ValidationError) as exc_info:
            cliente.save()
        
        assert 'edad' in exc_info.value.message_dict
    
    def test_cliente_saldo_negativo_invalido(self):
        """Test: Validar que el saldo no puede ser negativo"""
        user = User.objects.create_user('testuser4', 'test4@test.com', 'pass123')
        cliente = Cliente(
            usuario=user,
            edad=30,
            genero='F',
            saldo=-100.00,  # Saldo negativo
            activo=True,
            nivel_de_satisfaccion=3
        )
        
        with pytest.raises(ValidationError) as exc_info:
            cliente.save()
        
        assert 'saldo' in exc_info.value.message_dict
    
    def test_cliente_satisfaccion_invalida(self):
        """Test: Validar nivel de satisfacción (1-5)"""
        user = User.objects.create_user('testuser5', 'test5@test.com', 'pass123')
        cliente = Cliente(
            usuario=user,
            edad=30,
            genero='M',
            saldo=1000.00,
            activo=True,
            nivel_de_satisfaccion=6  # Mayor a 5
        )
        
        with pytest.raises(ValidationError) as exc_info:
            cliente.save()
        
        assert 'nivel_de_satisfaccion' in exc_info.value.message_dict
    
    def test_cliente_str_representation(self):
        """Test: Representación string del modelo"""
        user = User.objects.create_user('testuser6', 'test6@test.com', 'pass123')
        cliente = Cliente.objects.create(
            usuario=user,
            edad=25,
            genero='F',
            saldo=3000.00,
            activo=True,
            nivel_de_satisfaccion=5
        )
        
        assert str(cliente) == f"Cliente {cliente.cliente_id}"
    
    def test_cliente_genero_display(self):
        """Test: Display de género"""
        user = User.objects.create_user('testuser7', 'test7@test.com', 'pass123')
        cliente_m = Cliente.objects.create(
            usuario=user,
            edad=40,
            genero='M',
            saldo=10000.00,
            activo=True,
            nivel_de_satisfaccion=4
        )
        cliente_f = Cliente.objects.create(
            usuario=user,
            edad=35,
            genero='F',
            saldo=8000.00,
            activo=True,
            nivel_de_satisfaccion=5
        )
        
        assert cliente_m.get_genero_display() == 'Masculino'
        assert cliente_f.get_genero_display() == 'Femenino'
