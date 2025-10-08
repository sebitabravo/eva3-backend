"""
Tests para la API de clientes
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from clientes.models import Cliente

User = get_user_model()


@pytest.mark.django_db
class TestClienteAPI:
    """Tests para los endpoints de la API de clientes"""
    
    @pytest.fixture
    def api_client(self):
        """Cliente API para tests"""
        return APIClient()
    
    @pytest.fixture
    def user(self):
        """Usuario de prueba"""
        return User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
    
    @pytest.fixture
    def authenticated_client(self, api_client, user):
        """Cliente autenticado"""
        api_client.force_authenticate(user=user)
        return api_client
    
    @pytest.fixture
    def cliente(self, user):
        """Cliente de prueba"""
        return Cliente.objects.create(
            usuario=user,
            edad=30,
            genero='M',
            saldo=5000.00,
            activo=True,
            nivel_de_satisfaccion=4
        )
    
    def test_listar_clientes_sin_autenticacion(self, api_client):
        """Test: No se puede listar clientes sin autenticación"""
        response = api_client.get('/api/v1/clientes/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_listar_clientes_con_autenticacion(self, authenticated_client, cliente):
        """Test: Listar clientes con autenticación"""
        response = authenticated_client.get('/api/v1/clientes/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
    
    def test_crear_cliente(self, authenticated_client):
        """Test: Crear un nuevo cliente"""
        data = {
            'edad': 25,
            'genero': 'F',
            'saldo': '3000.00',
            'activo': True,
            'nivel_de_satisfaccion': 5
        }
        response = authenticated_client.post('/api/v1/clientes/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['edad'] == 25
        assert response.data['genero'] == 'F'
    
    def test_crear_cliente_con_edad_invalida(self, authenticated_client):
        """Test: No se puede crear cliente con edad inválida"""
        data = {
            'edad': 17,  # Menor de 18
            'genero': 'M',
            'saldo': '1000.00',
            'activo': True,
            'nivel_de_satisfaccion': 3
        }
        response = authenticated_client.post('/api/v1/clientes/', data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'edad' in response.data
    
    def test_actualizar_cliente(self, authenticated_client, cliente):
        """Test: Actualizar un cliente existente"""
        data = {
            'edad': 31,
            'genero': 'M',
            'saldo': '6000.00',
            'activo': True,
            'nivel_de_satisfaccion': 5
        }
        response = authenticated_client.put(f'/api/v1/clientes/{cliente.cliente_id}/', data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['edad'] == 31
        assert float(response.data['saldo']) == 6000.00
    
    def test_eliminar_cliente(self, authenticated_client, cliente):
        """Test: Eliminar un cliente"""
        response = authenticated_client.delete(f'/api/v1/clientes/{cliente.cliente_id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Cliente.objects.filter(cliente_id=cliente.cliente_id).exists()
    
    def test_estadisticas_cliente(self, authenticated_client, cliente):
        """Test: Obtener estadísticas de un cliente"""
        response = authenticated_client.get(f'/api/v1/clientes/{cliente.cliente_id}/estadisticas/')
        assert response.status_code == status.HTTP_200_OK
        assert 'cliente_id' in response.data
        assert 'nivel_satisfaccion_texto' in response.data
        assert 'ranking_saldo' in response.data
    
    def test_estadisticas_generales(self, authenticated_client, cliente):
        """Test: Obtener estadísticas generales"""
        response = authenticated_client.get('/api/v1/clientes/estadisticas-generales/')
        assert response.status_code == status.HTTP_200_OK
        assert 'total_clientes' in response.data
        assert 'por_genero' in response.data
        assert 'top_5_clientes_por_saldo' in response.data
        assert response.data['total_clientes'] >= 1
