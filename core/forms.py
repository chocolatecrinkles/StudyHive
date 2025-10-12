from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import StudySpace

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            "class": "w-full rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        })
    )

    password1 = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={
            "class": "w-full rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        })
    )

    password2 = forms.CharField(
        label="Confirm Password",
        widget=forms.PasswordInput(attrs={
            "class": "w-full rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        })
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")
        widgets = {
            "username": forms.TextInput(attrs={
                "class": "w-full rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }),
        }


class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            "class": "w-full rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            "class": "w-full rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        })
    )

class StudySpaceForm(forms.ModelForm):
    class Meta:
        model = StudySpace
        fields = ['name', 'location', 'description', 'rating', 'wifi', 'ac', 'free', 'image']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Enter study space name'}),
            'location': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Location (e.g. Lahug, Cebu)'}),
            'description': forms.Textarea(attrs={'class': 'form-textarea', 'placeholder': 'Describe this place...', 'rows': 4}),
            'rating': forms.NumberInput(attrs={'class': 'form-input', 'step': '0.1', 'min': '0', 'max': '5'}),
        }

