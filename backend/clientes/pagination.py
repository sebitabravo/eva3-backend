from rest_framework.pagination import PageNumberPagination


class ClientePagination(PageNumberPagination):
    """
    Paginación personalizada para clientes.

    Permite especificar el tamaño de página mediante el parámetro 'page_size' en el query string.
    Ejemplo: ?page_size=100
    """
    page_size = 20  # Tamaño por defecto
    page_size_query_param = 'page_size'  # Permite al cliente especificar page_size
    max_page_size = 10000  # Máximo permitido
