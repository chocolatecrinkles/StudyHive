from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100, blank=True, null=True)  # ✅ make optional
    middle_initial = models.CharField(max_length=1, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    avatar_url = models.ImageField(upload_to='avatars/', blank=True, null=True)

    is_contributor = models.BooleanField(default=False)


    def __str__(self):
        return self.user.username

class StudySpot(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField()
    wifi = models.BooleanField(default=False)
    ac = models.BooleanField(default=False)
    free = models.BooleanField(default=False)
    coffee = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    image = models.ImageField(upload_to='studyspots/', blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    
    #tagged / filter??? basta inig search
    wifi = models.BooleanField(default=False)
    open_24_7 = models.BooleanField(default=False)
    outlets = models.BooleanField(default=False)
    coffee = models.BooleanField(default=False)
    ac = models.BooleanField(default=False)
    pastries = models.BooleanField(default=False)
    def __str__(self):
        return self.name

class StaffApplication(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Personal Info
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    government_id = models.CharField(max_length=500, blank=True, null=True)
    
    # Study Place Info
    study_place_name = models.CharField(max_length=150)
    study_place_address = models.CharField(max_length=255)
    study_place_website = models.URLField(blank=True, null=True)
    business_registration_number = models.CharField(max_length=100, blank=True, null=True)
    proof_of_ownership = models.CharField(max_length=500, blank=True, null=True)
    role_description = models.CharField(max_length=100)
    proof_of_address = models.CharField(max_length=500, blank=True, null=True)

    social_media_links = models.TextField(blank=True, null=True)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('Pending', 'Pending'),
            ('Approved', 'Approved'),
            ('Rejected', 'Rejected'),
        ],
        default='Pending'
    )

    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.status})"
