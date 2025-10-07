from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login, logout
from core.forms import CustomUserCreationForm, CustomAuthenticationForm
from .models import UserProfile  
from django.http import JsonResponse


def login_view(request):

    if request.user.is_authenticated:
        return redirect("core:home")

    if request.method == "POST":
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            next_url = request.GET.get("next") or "core:home"
            return redirect(next_url)
        else:
            messages.error(request, "Invalid credentials.")
    else:
        form = CustomAuthenticationForm()
    return render(request, "login.html", {"form": form})



@login_required(login_url="core:login")
def home(request):
    return render(request, "home.html")


def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect("core:login")  # ✅ Namespace added


def register_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Account created successfully!")
            return redirect("core:home")  # ✅ Namespace added
        else:
            messages.error(request, "Please fix the errors below.")
    else:
        form = CustomUserCreationForm()
    return render(request, "register.html", {"form": form})


@login_required(login_url='core:login')
def profile_view(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    return render(request, "profile.html", {"profile": profile})

@login_required(login_url='core:login')
def manage_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "POST":
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        username = request.POST.get("username")
        email = request.POST.get("email")

        middle_initial = request.POST.get("middle_initial")
        phone_number = request.POST.get("phone_number")
        bio = request.POST.get("bio")
        avatar = request.FILES.get("avatar")
        remove_avatar = request.POST.get("remove_avatar")

        user = request.user
        user.first_name = first_name
        user.last_name = last_name
        user.username = username
        user.email = email
        user.save()

        profile.middle_initial = middle_initial
        profile.phone_number = phone_number
        profile.bio = bio

        if remove_avatar == 'true':
            profile.avatar_url.delete(save=False)
            profile.avatar_url = None
        elif avatar:
            profile.avatar_url = avatar

        profile.full_name = f"{first_name} {middle_initial or ''} {last_name}".strip()
        profile.save()

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({"status": "ok"})
        messages.success(request, "Profile updated successfully.")
        return redirect("core:profile")

    return render(request, "manage_profile.html", {"profile": profile})
