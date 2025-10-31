from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Authentication
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),

    # Profiles
    path('profile/', views.profile_view, name='profile'),
    path('profile/manage/', views.manage_profile, name='manage_profile'),

    # Main Pages
    path('home/', views.home, name='home'),           # 🏠 now shows the listings (Study Spots)
    path('map_view/', views.map_view, name='map_view'),  # 🗺️ shows the old home/dashboard layout

    # Listings Management (for staff)
    path('create-listing/', views.create_listing, name='create_listing'),
    path('my-listings/', views.my_listings_view, name='my_listings'),
    path('edit-listing/<int:spot_id>/', views.edit_listing, name='edit_listing'),
    path('delete-listing/<int:id>/', views.delete_listing, name='delete_listing'),

    # Staff Application
    path('apply-staff/', views.apply_staff, name='apply_staff'),
]
