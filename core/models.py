from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100, blank=True, null=True)  # ✅ make optional
    middle_initial = models.CharField(max_length=1, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    avatar_url = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return self.user.username

class StudySpot(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255)
    wifi_available = models.BooleanField(default=False)
    has_outlets = models.BooleanField(default=False)
    is_free = models.BooleanField(default=True)
    air_conditioned = models.BooleanField(default=False)
    image = models.ImageField(upload_to='study_spaces/', blank=True, null=True)

    def __str__(self):
        return self.name