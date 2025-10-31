from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login, logout
from core.forms import CustomUserCreationForm, CustomAuthenticationForm
from .models import UserProfile  
from django.http import JsonResponse
from core.models import StudySpot
from django.core.exceptions import PermissionDenied
from .models import StaffApplication
import os
from supabase import create_client
from dotenv import load_dotenv
from .forms import StaffApplicationForm
from .forms import StudySpotForm
from django.db.models import Q

def contributor_required(view_func):
    @login_required
    def wrapper(request, *args, **kwargs):
        profile = getattr(request.user, "userprofile", None)
        if not profile or not profile.is_contributor:
            raise PermissionDenied("You are not authorized to access this page.")
        return view_func(request, *args, **kwargs)
    return wrapper

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
    query = request.GET.get("q", "").strip()
    filter_by = request.GET.get("filter", "all")

    study_spaces = StudySpot.objects.all()

    # 🔎 Apply search (name, location, description)
    if query:
        study_spaces = study_spaces.filter(
            Q(name__icontains=query) |
            Q(location__icontains=query) |
            Q(description__icontains=query)
        )

    # 🧭 Apply filters (wifi, ac, coffee, etc.)
    if filter_by == "wifi":
        study_spaces = study_spaces.filter(wifi=True)
    elif filter_by == "ac":
        study_spaces = study_spaces.filter(ac=True)
    elif filter_by == "outlets":
        study_spaces = study_spaces.filter(outlets=True)
    elif filter_by == "coffee":
        study_spaces = study_spaces.filter(coffee=True)
    elif filter_by == "pastries":
        study_spaces = study_spaces.filter(pastries=True)
    elif filter_by == "open24":
        study_spaces = study_spaces.filter(open_24_7=True)

    context = {
        "study_spaces": study_spaces,
        "query": query,
        "filter_by": filter_by,
    }
    return render(request, "home.html", context)



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
        # Get form data
        first_name = request.POST.get("first_name", "").strip()
        last_name = request.POST.get("last_name", "").strip()
        username = request.POST.get("username", "").strip()
        email = request.POST.get("email", "").strip()
        middle_initial = request.POST.get("middle_initial", "").strip()
        phone_number = request.POST.get("phone_number", "").strip()
        bio = request.POST.get("bio", "").strip()
        
        # Get file and removal flag
        avatar = request.FILES.get("avatar")
        avatar_removed = request.POST.get("avatar_removed")

        # Validate required fields
        if not first_name or not last_name or not username or not email:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({"status": "error", "message": "First name, last name, username, and email are required."}, status=400)
            messages.error(request, "First name, last name, username, and email are required.")
            return redirect("core:manage_profile")

        # Update user fields
        user = request.user
        user.first_name = first_name
        user.last_name = last_name
        user.username = username
        user.email = email
        user.save()

        # Update profile fields
        profile.middle_initial = middle_initial
        profile.phone_number = phone_number
        profile.bio = bio

        # Handle avatar removal
        if avatar_removed == 'true':
            # Delete existing avatar if it exists
            if profile.avatar_url:
                profile.avatar_url.delete(save=False)
                profile.avatar_url = None
        # Handle new avatar upload (only if not removing)
        elif avatar:
            # Delete old avatar if uploading new one
            if profile.avatar_url:
                profile.avatar_url.delete(save=False)
            profile.avatar_url = avatar

        # Update full name
        profile.full_name = f"{first_name} {middle_initial} {last_name}".strip()
        profile.save()

        # Return JSON response if AJAX request
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({"status": "ok", "message": "Profile updated successfully."})
        
        # Regular form submission
        messages.success(request, "Profile updated successfully.")
        return redirect("core:profile")

    context = {
        "profile": profile,
        "user": request.user,
    }
    return render(request, "manage_profile.html", context)


@login_required(login_url="core:login")
def map_view(request):
    query = request.GET.get("q", "")
    filter_by = request.GET.get("filter", "all")

    study_spots = StudySpot.objects.all()

    if query:
        study_spots = study_spots.filter(
            Q(name__icontains=query) |
            Q(location__icontains=query) |
            Q(description__icontains=query)
        )

    if filter_by == "wifi":
        study_spots = study_spots.filter(wifi=True)
    elif filter_by == "ac":
        study_spots = study_spots.filter(ac=True)
    elif filter_by == "coffee":
        study_spots = study_spots.filter(coffee=True)
    elif filter_by == "open24":
        study_spots = study_spots.filter(open_24_7=True)

    return render(request, "map_view.html", {"study_spots": study_spots})



@contributor_required
def create_listing(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        location = request.POST.get('location')
        description = request.POST.get('description')
        wifi = request.POST.get('wifi') == 'on'
        ac = request.POST.get('ac') == 'on'
        free = request.POST.get('free') == 'on'
        coffee = request.POST.get('coffee') == 'on'
        rating = request.POST.get('rating')
        image = request.FILES.get('image')

        # ✅ Save the record to Supabase DB
        StudySpot.objects.create(
            owner=request.user,
            name=name,
            location=location,
            description=description,
            wifi=wifi,
            ac=ac,
            free=free,
            coffee=coffee,
            rating=0,
            image=image
        )

        messages.success(request, "✅ Listing successfully created!")
        return redirect('core:home')

    return render(request, 'create_listing.html')

@contributor_required
def my_listings_view(request):
    my_listings = StudySpot.objects.filter(owner=request.user).order_by('-id')
    return render(request, 'my_listings.html', {'my_listings': my_listings})



@contributor_required
def edit_listing(request, spot_id):
    spot = get_object_or_404(StudySpot, id=spot_id)
    if request.method == "POST":
        form = StudySpotForm(request.POST, request.FILES, instance=spot)
        if form.is_valid():
            form.save()
            return redirect('core:my_listings')
    else:
        form = StudySpotForm(instance=spot)

    return render(request, 'edit_listing.html', {'form': form, 'spot': spot})



@contributor_required
def delete_listing(request, id):
    spot = get_object_or_404(StudySpot, id=id)

    # ---CRITICAL SECURITY CHECK ---
    if spot.owner != request.user:
        messages.error(request, "You are not authorized to delete this listing.")
        return redirect('core:my_listings')
    # --- END OF CHECK ---

    if request.method == "POST":
        spot.delete()
        messages.success(request, "Listing successfully deleted.")
    
    return redirect("core:my_listings")


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@login_required
def apply_staff(request):
    # Get existing application (if any)
    application = StaffApplication.objects.filter(user=request.user).first()

    if request.method == "POST":
        form = StaffApplicationForm(request.POST, request.FILES, instance=application)
        if form.is_valid():
            app = form.save(commit=False)
            app.user = request.user
            app.status = "Pending"
            app.save()

            # Upload each file field to Supabase Storage
            file_fields = ["government_id", "proof_of_ownership", "proof_of_address"]
            for field_name in file_fields:
                uploaded_file = request.FILES.get(field_name)
                if uploaded_file:
                    path = f"staff_docs/{field_name}/{uploaded_file.name}"
                    file_content = uploaded_file.read()
                    supabase.storage.from_("staff_docs").upload(path, file_content)

                    # Generate public URL for the uploaded file
                    public_url = supabase.storage.from_("staff_docs").get_public_url(path)
                    setattr(app, field_name, public_url)

            app.save()

            return render(request, "apply_staff.html", {
                "submitted": True,
                "application": app,
            })

        else:
            return render(request, "apply_staff.html", {
                "form": form,
                "application": application,
                "error": "Please check your form fields and try again.",
            })

    else:
        form = StaffApplicationForm(instance=application)

    return render(request, "apply_staff.html", {
        "form": form,
        "application": application,
    })

