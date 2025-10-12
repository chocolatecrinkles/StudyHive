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
    path('home/listings/', views.listings_view, name='listings'),
    path('listings/create/', views.create_listing, name='create_listing'),
]

