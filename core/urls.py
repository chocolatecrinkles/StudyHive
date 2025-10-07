from django.urls import path
from . import views

app_name = 'core' 
urlpatterns = [
    path('', views.login_view, name='login'),       # Default route (login page)
    path('home/', views.home, name='home'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('profile/', views.profile_view, name='profile'),

]
