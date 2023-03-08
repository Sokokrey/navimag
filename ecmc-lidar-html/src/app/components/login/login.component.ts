import { Component, OnInit } from '@angular/core';
import { Login } from '../../models/login';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] 
})

export class LoginComponent implements OnInit {

  login: Login = {
    url: '',
    user: '',
    password: '',
    category: 0,
    validated: 0
  };
  api_url: string;
  is_api: boolean;
  interval: any;
  formGroup: FormGroup;
  titleAlert: string = 'This field is required';

  constructor(private loginService: LoginService, private formBuilder: FormBuilder, private router: Router) { }

  ngOnInit() {
    if (this.loginService.loggedIn())
      this.router.navigate(['/']); //Home

    this.api_url = (localStorage.getItem('API_URL')) ? localStorage.getItem('API_URL') : 'http://192.168.210.8:8000';
    this.is_api  = !!(this.api_url);
    this.createForm();
    this.setChangeValidate(); 
  }

  createForm() {
    let urlregex: RegExp = /^(http|https):\/\/(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])(:[0-9]+)?$/
    this.formGroup = this.formBuilder.group({
      'url': [null, [Validators.required, Validators.pattern(urlregex)]],
      'user': [null, [Validators.required]],
      'password': [null, [Validators.required, Validators.minLength(4)]],
      'validate': ''
    });
  }

  setChangeValidate() {
    this.formGroup.get('validate').valueChanges.subscribe(
      (validate) => {
        if (validate == '1') {
          this.formGroup.get('name').setValidators([Validators.required, Validators.minLength(3)]);
          this.titleAlert = "You need to specify at least 3 characters";
        } else {
          this.formGroup.get('name').setValidators(Validators.required);
        }
        this.formGroup.get('name').updateValueAndValidity();
      }
    )
  }
  
  checkPassword(control) {
    let enteredPassword = control.value
    let passwordCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    return (!passwordCheck.test(enteredPassword) && enteredPassword) ? { 'requirements': true } : null;
  }

  getErrorUrl() {
    return this.formGroup.get('url').hasError('required') ? 'Este campo es requerido' :
      this.formGroup.get('url').hasError('pattern') ? 'URL no válida' :
        this.formGroup.get('url').hasError('alreadyInUse') ? 'URL y puerto en uso' : '';
  }

  getErrorUser() {
    return this.formGroup.get('user').hasError('required') ? 'Escriba su usuario' :
      this.formGroup.get('user').hasError('pattern') ? 'Usuario no válido' :
        this.formGroup.get('user').hasError('alreadyInUse') ? 'Este usuario ya esta en uso' : '';
  }

  getErrorPassword() {
    return this.formGroup.get('password').hasError('required') ? 'Debe escribir la contraseña' :
      this.formGroup.get('password').hasError('minlength') ? 'La password debe tener almenos 4 caracteres' : '';
  }

  log_in() {
    localStorage.setItem('API_URL',`${this.api_url}`);
    this.loginService.login(this.login)
      .subscribe(
        res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', res.user);
          localStorage.setItem('name', res.name);
          localStorage.setItem('category', res.category);
          this.router.navigate(['/']);
        },
        err => alert("Please check your user email and password.")
      );
  }
}