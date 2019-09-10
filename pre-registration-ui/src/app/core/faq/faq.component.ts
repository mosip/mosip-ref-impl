import { Component, OnInit } from '@angular/core';
import { DataStorageService } from '../services/data-storage.service';
import LanguageFactory from 'src/assets/i18n';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  langCode = '';
  data = [];
  answerTranslation = '';

  constructor(private dataStorageService: DataStorageService) {}

  ngOnInit() {
    this.langCode = localStorage.getItem('langCode');
    let factory = new LanguageFactory(this.langCode);
    let response = factory.getCurrentlanguage();
    this.data = response['faq']['questions'];
    this.answerTranslation = response['faq']['answer'];
  }
}
