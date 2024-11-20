from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Cliente(models.Model):
    GENERO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
    ]
    NIVEL_SATISFACCION_CHOICES = [
        (1, 'Muy Insatisfecho'),
        (2, 'Insatisfecho'),
        (3, 'Neutral'),
        (4, 'Satisfecho'),
        (5, 'Muy Satisfecho'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    cliente_id = models.AutoField(primary_key=True)
    edad = models.IntegerField()
    genero = models.CharField(max_length=1, choices=GENERO_CHOICES)
    saldo = models.DecimalField(max_digits=100, decimal_places=2)
    activo = models.BooleanField(default=True)
    nivel_de_satisfaccion = models.IntegerField(
        choices=NIVEL_SATISFACCION_CHOICES)

    def __str__(self):
        return f"Cliente {self.cliente_id}"
