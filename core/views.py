from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required

def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, "Logged in.")
            return redirect(request.GET.get("next") or "home")
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()
    return render(request, "login.html", {"form": form})

def logout_view(request):
    logout(request)
    messages.info(request, "Logged out.")
    return redirect("login")

@login_required
def home(request):
    return render(request, "home.html", {"username": request.user.username})
