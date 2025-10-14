from django.urls import path
from . import views

app_name = 'core' 


urlpatterns = [
    path('', views.login_view, name='login'),
    path('home/', views.home, name='home'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('profile/', views.profile_view, name='profile'),
    path('profile/manage/', views.manage_profile, name='manage_profile'),  
     
    # Listings
    path('listings/', views.listings_view, name='listings'),
    path('listings/create/', views.create_listing, name='create_listing'),
    path('my_listings/', views.my_listings_view, name='my_listings'),  # ✅ ADDED
    path('edit_listing/<int:id>/', views.edit_listing, name='edit_listing'),
    path('delete_listing/<int:id>/', views.delete_listing, name='delete_listing'),
]

