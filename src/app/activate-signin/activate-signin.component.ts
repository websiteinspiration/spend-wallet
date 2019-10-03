import { Component, OnInit, Renderer2, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activate-signin',
  templateUrl: './activate-signin.component.html',
  styleUrls: ['./activate-signin.component.scss']
})
export class ActivateSigninComponent implements OnInit, OnDestroy {
  form: FormGroup;
  bodyEl: any;
  errors = [];
  isSubmitted = false;

  constructor(
    private _fb: FormBuilder,
    private _auth: AuthService,
    private _router: Router,
    private renderer: Renderer2,
    private elRef: ElementRef
  ) {
    this.form = _fb.group({
      username: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    });
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.loadBackground();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.renderer.removeAttribute(this.bodyEl, 'background');
    this.renderer.removeStyle(this.bodyEl, 'background-color');
    this.renderer.removeStyle(this.bodyEl, 'background-size');
    this.renderer.removeStyle(this.bodyEl, 'background-repeat');
  }

  loadBackground() {
    this.renderer.setStyle(this.bodyEl, 'background-size', 'cover');
    this.renderer.setStyle(this.bodyEl, 'background-repeat', 'no-repeat');
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  signin() {
    if (this.form.valid) {
      this.isSubmitted = true;
      this._auth.login(this.form.value).subscribe((res: any) => {
        this.isSubmitted = false;
        if (res.success) {
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this._router.navigate(['activate/card']);
        } else {
          this.errors = res.error;
        }
      });
    }
  }
}
