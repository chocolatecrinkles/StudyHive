from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User

COMMON_INPUT_CLASSES = (
    "w-full rounded-md border-2 border-[#8BC29A] bg-white text-slate-800 "
    "px-4 py-2.5 font-[Nunito_Sans] text-[0.95rem] font-medium "
    "placeholder:text-gray-400 focus:outline-none focus:border-yellow-300 "
    "focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
)

LABEL_CLASSES = (
    "block text-sm font-[Nunito_Sans] font-bold text-[#4B4B4B] tracking-wide mb-1 capitalize"
)

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            "class": COMMON_INPUT_CLASSES,
            "placeholder": "Enter your email",
        })
    )

    password1 = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={
            "class": COMMON_INPUT_CLASSES,
            "placeholder": "Enter password",
        })
    )

    password2 = forms.CharField(
        label="Confirm Password",
        widget=forms.PasswordInput(attrs={
            "class": COMMON_INPUT_CLASSES,
            "placeholder": "Confirm password",
        })
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")
        widgets = {
            "username": forms.TextInput(attrs={
                "class": COMMON_INPUT_CLASSES,
                "placeholder": "Choose a username",
            }),
        }

    # Optional: If you want Django to render your labels with that style automatically
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.label_suffix = ""
            field.widget.attrs["autocomplete"] = "off"
            field.widget.attrs["aria-label"] = field.label
            field.label_tag = lambda *a, **kw: f'<label class="{LABEL_CLASSES}" for="{field.id_for_label}">{field.label}</label>'


class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            "class": COMMON_INPUT_CLASSES,
            "placeholder": "Enter your username",
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            "class": COMMON_INPUT_CLASSES,
            "placeholder": "Enter your password",
        })
    )
