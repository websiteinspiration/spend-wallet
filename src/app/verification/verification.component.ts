import { Component, OnInit, Renderer2, ElementRef, OnDestroy } from '@angular/core';
import { UserService } from '../apis/user.service';
import { User } from '../models/user.model';
import { AlertService } from '../services/alert.service';
import { Router } from '@angular/router';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit, OnDestroy {

  user: User;
  step = 1;
  maxTier = 0;
  nin_photo: any = undefined;
  extra_doc_1: any = undefined;
  extra_doc_2: any = undefined;
  nin_document: any = undefined;
  private bodyEl: any = undefined;

  constructor(
    private router: Router,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private userService: UserService,
    private utilService: UtilService,
    private alertService: AlertService
  ) {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.loadBackground();
  }

  ngOnInit() {
    this.user = this.userService.currentUser;
    this.getVersions();
  }

  getVersions() {
    this.utilService.getApiVersions()
      .subscribe(
        (data: any) => {
          if (data.success) {
            this.maxTier = data.data.restrictions.entities.maximum.tier;
          } else {
          }
        },
        (error: any) => {
        }
      );
  }

  loadBackground() {
    this.renderer.setStyle(this.bodyEl, 'background-size', 'auto');
    this.renderer.setStyle(this.bodyEl, 'background-repeat', 'no-repeat');
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  onUpgrade() {
    if (this.user['tierStatus'] && this.user['tierStatus'] === 'pending') {
      this.alertService.error('Tier upgrade in alreading in pending');
      this.router.navigate(['profile']);
    } else {
      this.step = 2;
    }
  }

  onGetStarted() {
    this.step = 3;
  }

  onFileUpload(input) {
    const id = input.id;
    const files = input.files;
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    const imgFile = files[0];
    if (!allowedExtensions.exec(imgFile.name)) {
      this.alertService.error('Invalid File type');
    } else {
      this.utilService.getBase64(imgFile).then(img => {
        let type = '';
        let source = '';
        switch (id) {
          case 'file1':
            type = 'nin_photo';
            source = 'nin_photo';
            this.nin_photo = 'loading';
            break;
          case 'file3':
            type = 'nin_document';
            source = 'nin_document';
            this.nin_document = 'loading';
            break;
          case 'file2':
            type = 'extra_doc';
            source = 'extra_doc_1';
            this.extra_doc_1 = 'loading';
            break;
          case 'file4':
            type = 'extra_doc';
            source = 'extra_doc_2';
            this.extra_doc_2 = 'loading';
            break;
        }
        this.uploadFile(img, type, source);
      });
    }
  }

  uploadFile(data, type, soruce) {
    this.userService.userDocs(data, type)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this[soruce] = data;
            this.checkAllUploaded();
          } else {
            this.alertService.error(res.error[0].message);
          }
        },
        (error: any) => {
        }
      );
  }

  checkAllUploaded() {
    if (this.nin_photo && this.nin_document && this.extra_doc_1 && this.extra_doc_2) {
      this.alertService.success('Tier upgrade in process');
      this.router.navigate(['profile']);
    }
  }

  ngOnDestroy() {
    this.renderer.removeAttribute(this.bodyEl, 'background');
    this.renderer.removeStyle(this.bodyEl, 'background-color');
    this.renderer.removeStyle(this.bodyEl, 'background-size');
    this.renderer.removeStyle(this.bodyEl, 'background-repeat');
  }
}
