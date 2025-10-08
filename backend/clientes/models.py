from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

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

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    cliente_id = models.AutoField(primary_key=True)
    edad = models.IntegerField()
    genero = models.CharField(max_length=1, choices=GENERO_CHOICES)
    saldo = models.DecimalField(max_digits=100, decimal_places=2)
    activo = models.BooleanField(default=True)
    nivel_de_satisfaccion = models.IntegerField(
        choices=NIVEL_SATISFACCION_CHOICES)

    def __str__(self):
        return f"Cliente {self.cliente_id}"
    
    def clean(self):
        """Validaciones personalizadas del modelo"""
        errors = {}
        
        # Validar edad
        if self.edad < 18:
            errors['edad'] = 'El cliente debe ser mayor de 18 años'
        elif self.edad > 120:
            errors['edad'] = 'La edad no puede ser mayor a 120 años'
        
        # Validar saldo
        if self.saldo < 0:
            errors['saldo'] = 'El saldo no puede ser negativo'
        
        # Validar nivel de satisfacción
        if self.nivel_de_satisfaccion < 1 or self.nivel_de_satisfaccion > 5:
            errors['nivel_de_satisfaccion'] = 'El nivel de satisfacción debe estar entre 1 y 5'
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Override save para ejecutar validaciones"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-cliente_id']
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
